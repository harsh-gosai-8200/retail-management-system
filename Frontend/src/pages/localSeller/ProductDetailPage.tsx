import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Store,
    IndianRupee,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    ShoppingCart,
    Lock,
    Building2,
    MapPin,
    Star,
    Truck,
    RotateCcw,
    Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, type Product } from '../../services/api';
import { cartService } from '../../services/cartService';
import { useCartState } from '../../hooks/useCartState';
import { Button } from '../../components/ui/button';

type SubscriptionStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";

export function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const sellerId = user?.id;
    const sellerCity = user?.city;

    const [product, setProduct] = useState<Product | null>(null);
    const [wholesaler, setWholesaler] = useState<any>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('NONE');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [hasOtherWholesalerInCart, setHasOtherWholesalerInCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string>('');

    const { isInCart, addToCart, removeFromCart, cartCount, refreshCart } = useCartState(sellerId);

    useEffect(() => {
        loadProductDetails();
        checkCart();
    }, [productId, sellerId]);

    const loadProductDetails = async () => {
        try {
            setLoading(true);
            const productData = await api.getProduct(parseInt(productId!));
            setProduct(productData);
            setActiveImage(productData.imageUrl || '');

            const wholesalerData = await api.getWholesalers();
            const foundWholesaler = wholesalerData.find((w: any) => w.id === productData.wholesalerId);
            setWholesaler(foundWholesaler);

            if (sellerId && productData.wholesalerId) {
                const status = await api.getSubscriptionStatus(sellerId, productData.wholesalerId);
                setSubscriptionStatus(status.status || 'NONE');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkCart = async () => {
        if (!sellerId) return;
        try {
            const cart = await cartService.getCart(sellerId);
            if (cart.items.length > 0 && product) {
                const hasOther = cart.items.some(item => item.wholesalerId !== product.wholesalerId);
                setHasOtherWholesalerInCart(hasOther);
            }
        } catch (err) {
            console.error('Failed to load cart:', err);
        }
    };

    const handleSubscribe = async () => {
        if (!sellerId || !product?.wholesalerId) return;

        try {
            await api.subscribeWholesaler(sellerId, product.wholesalerId);
            const status = await api.getSubscriptionStatus(sellerId, product.wholesalerId);
            setSubscriptionStatus(status.status || 'PENDING');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCartAction = async () => {
        if (!product?.id) return;

        if (isInCart(product.id)) {
            navigate('/local-seller/cart');
        } else {
            setAddingToCart(true);
            const success = await addToCart(product.id, quantity, product.wholesalerId);
            if (success) {
                refreshCart();
            }
            setAddingToCart(false);
        }
    };

    const handleViewAllProducts = () => {
        if (product?.wholesalerId) {
            navigate(`/local-seller/wholesaler/${product.wholesalerId}`);
        }
    };

    const updateQuantity = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error || 'Product not found'}</span>
                </div>
            </div>
        );
    }

    const isApproved = subscriptionStatus === 'APPROVED';
    const isPending = subscriptionStatus === 'PENDING';
    const inStock = product.stockQuantity > 0;
    const lowStock = product.stockQuantity > 0 && product.stockQuantity < 10;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            <button
                onClick={() => navigate('/local-seller/products')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT COLUMN - Product Image */}
                <div className="space-y-3">
                    <div className="aspect-square rounded-lg border border-slate-200 bg-white p-4 overflow-hidden">
                        {activeImage && activeImage !== 'null' ? (
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-24 w-24 text-slate-300" />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN - Product Info */}
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {product.category}
                            </span>
                            {!inStock && (
                                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    Out of Stock
                                </span>
                            )}
                            {lowStock && inStock && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    Only {product.stockQuantity} left
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            {product.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">SKU: {product.skuCode}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(4)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="h-4 w-4 text-slate-300" />
                        </div>
                        <span className="text-sm text-slate-500">(128 ratings)</span>
                    </div>

                    <div className="border-t border-b border-slate-200 py-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                                ₹{product.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500 line-through">
                                ₹{(product.price * 1.2).toLocaleString()}
                            </span>
                            <span className="text-sm text-green-600">20% off</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Inclusive of all taxes
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <Truck className="h-4 w-4 text-slate-500" />
                            <span>Free delivery on orders above ₹50,000</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <RotateCcw className="h-4 w-4 text-slate-500" />
                            <span>7 days return policy</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-slate-500" />
                            <span>GST invoice available</span>
                        </div>
                    </div>

                    <div className="py-2">
                        <h3 className="font-medium text-slate-900 mb-1">Product Description</h3>
                        <p className="text-sm text-slate-600">
                            {product.description || 'No description available.'}
                        </p>
                    </div>

                    {inStock && isApproved && !isInCart(product.id!) && (
                        <div className="flex items-center gap-4 py-2">
                            <span className="text-sm text-slate-600">Quantity:</span>
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => updateQuantity(quantity - 1)}
                                    disabled={quantity <= 1}
                                    className="px-3 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    -
                                </button>
                                <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
                                <button
                                    onClick={() => updateQuantity(quantity + 1)}
                                    disabled={quantity >= product.stockQuantity}
                                    className="px-3 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-xs text-slate-500">
                                {product.stockQuantity} units available
                            </span>
                        </div>
                    )}

                    {inStock && isApproved && isInCart(product.id!) && (
                        <div className="flex items-center gap-4 py-2">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                <ShoppingCart className="h-4 w-4" />
                                <span className="text-sm font-medium">Item already in cart</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-600">Subscription Status</span>
                                </div>
                                {isApproved ? (
                                    <span className="inline-flex items-center gap-1 text-sm text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        Approved
                                    </span>
                                ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 text-sm text-yellow-700">
                                        <Clock className="h-4 w-4" />
                                        Pending Approval
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                        <Lock className="h-4 w-4" />
                                        Not Subscribed
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isApproved && !isPending && (
                            <Button
                                onClick={handleSubscribe}
                                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                            >
                                Subscribe to Wholesaler
                            </Button>
                        )}

                        {isPending && (
                            <div className="rounded-lg bg-yellow-50 p-3 text-center text-sm text-yellow-700">
                                Your subscription request is pending approval from the wholesaler.
                            </div>
                        )}

                        {isApproved && (
                            <>
                                {hasOtherWholesalerInCart && !isInCart(product.id!) ? (
                                    <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
                                        Your cart already has items from another wholesaler.
                                        Please complete that order first.
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleCartAction}
                                        disabled={addingToCart || !inStock}
                                        className={`w-full h-12 text-base font-semibold ${isInCart(product.id!)
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                                            }`}
                                    >
                                        {addingToCart ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (isInCart(product.id!) || addingToCart) ? (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                View in Cart ({cartCount})
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                {!inStock ? 'Out of Stock' : 'Add to Cart'}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </>
                        )}

                        <Button
                            onClick={handleViewAllProducts}
                            variant="outline"
                            className="w-full h-11"
                        >
                            View All Products from {wholesaler?.businessName}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Wholesaler Info Section */}
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Sold by</h2>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <p className="font-medium text-slate-900">{wholesaler?.businessName}</p>
                        <p className="text-sm text-slate-500 mt-1">{wholesaler?.address}</p>
                        {sellerCity && (
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                Serves: {sellerCity}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAllProducts}
                    >
                        Visit Store
                    </Button>
                </div>
            </div>
        </div>
    );
}