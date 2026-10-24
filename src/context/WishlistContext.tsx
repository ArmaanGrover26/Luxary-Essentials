"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
    ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

const GUEST_WISHLIST_KEY = "le_guest_wishlist";

interface WishlistContextType {
    wishlistIds: string[];
    wishlistCount: number;
    loading: boolean;
    isWishlisted: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<boolean>;
    addToWishlist: (productId: string) => Promise<boolean>;
    removeFromWishlist: (productId: string) => Promise<boolean>;
    refreshWishlist: () => Promise<void>;
    wishlistNotification: string | null;
    clearWishlistNotification: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishlistNotification, setWishlistNotification] = useState<string | null>(null);
    const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const prevUserIdRef = useRef<string | null>(null);

    const showNotification = useCallback((message: string) => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        setWishlistNotification(message);
        notificationTimerRef.current = setTimeout(() => {
            setWishlistNotification(null);
        }, 2500);
    }, []);

    const clearWishlistNotification = useCallback(() => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        setWishlistNotification(null);
    }, []);

    // Helper: read guest wishlist from localStorage
    const getGuestWishlist = (): string[] => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    };

    // Helper: save guest wishlist to localStorage
    const saveGuestWishlist = (ids: string[]) => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
        } catch {
            // ignore
        }
    };

    // Fetch authenticated user wishlist
    const fetchUserWishlist = useCallback(async (authToken: string) => {
        try {
            const res = await fetch("/api/wishlist", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data?.productIds)) {
                setWishlistIds(data.data.productIds);
            }
        } catch (err) {
            console.error("Failed to fetch user wishlist", err);
        }
    }, []);

    // Merge guest wishlist on login and load server wishlist
    useEffect(() => {
        const handleAuthChange = async () => {
            setLoading(true);
            const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);

            if (user && currentToken) {
                // If transitioning from guest to logged-in
                const guestIds = getGuestWishlist();
                if (guestIds.length > 0) {
                    try {
                        const mergeRes = await fetch("/api/wishlist/merge", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${currentToken}`,
                            },
                            body: JSON.stringify({ productIds: guestIds }),
                        });
                        const mergeData = await mergeRes.json();
                        if (mergeData.success && Array.isArray(mergeData.data?.productIds)) {
                            setWishlistIds(mergeData.data.productIds);
                            localStorage.removeItem(GUEST_WISHLIST_KEY);
                        } else {
                            await fetchUserWishlist(currentToken);
                        }
                    } catch {
                        await fetchUserWishlist(currentToken);
                    }
                } else {
                    await fetchUserWishlist(currentToken);
                }
            } else {
                // Guest mode
                const guestIds = getGuestWishlist();
                setWishlistIds(guestIds);
            }
            prevUserIdRef.current = user?.id || null;
            setLoading(false);
        };

        handleAuthChange();
    }, [user, token, fetchUserWishlist]);

    const isWishlisted = useCallback(
        (productId: string) => {
            if (!productId) return false;
            return wishlistIds.includes(String(productId));
        },
        [wishlistIds]
    );

    const toggleWishlist = useCallback(
        async (productId: string): Promise<boolean> => {
            if (!productId) return false;
            const pId = String(productId);
            const currentlySaved = wishlistIds.includes(pId);
            const nextState = !currentlySaved;

            // Optimistic update
            const nextList = nextState
                ? Array.from(new Set([...wishlistIds, pId]))
                : wishlistIds.filter((id) => id !== pId);

            setWishlistIds(nextList);

            const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);

            if (!user || !currentToken) {
                // Guest persistence
                saveGuestWishlist(nextList);
                showNotification(nextState ? "Saved to your Wishlist" : "Removed from your Wishlist");
                return nextState;
            }

            // Authenticated persistence
            try {
                if (nextState) {
                    const res = await fetch("/api/wishlist", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${currentToken}`,
                        },
                        body: JSON.stringify({ productId: pId }),
                    });
                    const data = await res.json();
                    if (!data.success) {
                        // Rollback
                        setWishlistIds(wishlistIds);
                        showNotification("Could not save to wishlist. Please try again.");
                        return currentlySaved;
                    }
                    showNotification("Saved to your Wishlist");
                } else {
                    const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(pId)}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${currentToken}`,
                        },
                    });
                    const data = await res.json();
                    if (!data.success) {
                        // Rollback
                        setWishlistIds(wishlistIds);
                        showNotification("Could not remove from wishlist. Please try again.");
                        return currentlySaved;
                    }
                    showNotification("Removed from your Wishlist");
                }
                return nextState;
            } catch (err) {
                console.error("Wishlist toggle error", err);
                setWishlistIds(wishlistIds); // Rollback
                showNotification("Network error. Please try again.");
                return currentlySaved;
            }
        },
        [wishlistIds, user, token, showNotification]
    );

    const addToWishlist = useCallback(
        async (productId: string): Promise<boolean> => {
            if (isWishlisted(productId)) return true;
            return toggleWishlist(productId);
        },
        [isWishlisted, toggleWishlist]
    );

    const removeFromWishlist = useCallback(
        async (productId: string): Promise<boolean> => {
            if (!isWishlisted(productId)) return false;
            return toggleWishlist(productId);
        },
        [isWishlisted, toggleWishlist]
    );

    const refreshWishlist = useCallback(async () => {
        const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);
        if (user && currentToken) {
            await fetchUserWishlist(currentToken);
        } else {
            setWishlistIds(getGuestWishlist());
        }
    }, [user, token, fetchUserWishlist]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                wishlistCount: wishlistIds.length,
                loading,
                isWishlisted,
                toggleWishlist,
                addToWishlist,
                removeFromWishlist,
                refreshWishlist,
                wishlistNotification,
                clearWishlistNotification,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
