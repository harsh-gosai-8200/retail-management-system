import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoaderData, useRevalidator, Form as RemixForm, useSearchParams, useNavigate } from "react-router";
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  ShoppingBag,
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { cn } from "~/lib/utils";
import { api, type Product, type SpringPage } from "~/services/api";
import { productSchema, type ProductFormData } from "~/lib/schemas/wholesaler";
import { useAuth } from "~/context/AuthContext";


// Loader to fetch products with pagination, search, and filtering
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const size = parseInt(url.searchParams.get("size") || "10");
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "all";

  // Get wholesaler ID from localStorage if available (client-side)
  let wholesalerId = 1;
  if (typeof window !== "undefined") {
    const storedId = localStorage.getItem("user_id");
    if (storedId) {
      wholesalerId = parseInt(storedId);
    }
  }

  try {

    let products: Product[] = [];
    let pagination = {
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
    };

    // All API methods now return SpringPage<Product>
    let response: SpringPage<Product>;

    if (search) {
      response = await api.searchProducts(wholesalerId, search, page, size);
    } else if (category && category !== "all") {
      response = await api.getProductsByCategory(wholesalerId, category, page, size);
    } else {
      // Default fetch
      response = await api.getProducts(wholesalerId, page, size);
      console.log(response);
    }

    // Map SpringPage to component state
    products = response.content || [];
    pagination = {
      totalItems: response.totalElements,
      totalPages: response.totalPages,
      currentPage: response.number,
    };

    const categories = ["All", "Electronics", "Clothing", "Groceries", "Home & Kitchen", "Beauty & Personal Care", "Sports & Fitness", "Toys & Games", "Books", "Automotive"];
    return { products, categories, pagination, error: null, wholesalerId };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      categories: ["All", "Electronics", "Clothing", "Groceries", "Home & Kitchen", "Beauty & Personal Care", "Sports & Fitness", "Toys & Games", "Books", "Automotive"],
      pagination: { totalItems: 0, totalPages: 0, currentPage: 0 },
      error: "Failed to load products. Please check the backend connection.",
      wholesalerId
    };
  }
}

export default function ProductsPage() {
  const { products: initialProducts, categories, pagination, error, wholesalerId: loaderWholesalerId } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  // Use user from context if available, otherwise fallback to loader data
  const { user } = useAuth();
  const wholesalerId = user?.id || loaderWholesalerId || 1;

  const [products, setProducts] = useState<Product[]>(Array.isArray(initialProducts) ? initialProducts : []);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local search term for input field to avoid jitter, synced with URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync products with loader data
  useEffect(() => {
    if (Array.isArray(initialProducts)) {
      setProducts(initialProducts);
    } else {
      setProducts([]);
    }
    if (error) {
      toast.error(error);
    }
  }, [initialProducts, error]);

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("search") || "")) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (searchTerm) {
            newParams.set("search", searchTerm);
          } else {
            newParams.delete("search");
          }
          newParams.set("page", "0"); // Reset to page 0 on search
          return newParams;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value && value !== "all") {
        newParams.set("category", value);
      } else {
        newParams.delete("category");
      }
      newParams.set("page", "0"); // Reset to page 0 on filter
      return newParams;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };
  useEffect(() => {
    if (Array.isArray(initialProducts)) {
      setProducts(initialProducts);
    } else {
      setProducts([]);
    }
    if (error) {
      toast.error(error);
    }
  }, [initialProducts, error]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      stockQuantity: 0,
      unit: "piece",
      skuCode: "",
      wholesalerId: wholesalerId, // Dynamic wholesaler ID
      imageUrl: "",
      isActive: true,
    },
  });
  // No client-side filtering needed, usage products directly
  // const filteredProducts = products;

  // Stats
  const lowStockProducts = products.filter((p) => p.stockQuantity < 10 && p.stockQuantity > 0).length;
  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0).length;

  const handleCreateOpen = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      category: "",
      price: 0,
      stockQuantity: 0,
      unit: "piece",
      skuCode: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`, // Auto-generate SKU
      wholesalerId: wholesalerId,
      imageUrl: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditOpen = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      id: product.id,
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      unit: product.unit as any,
      skuCode: product.skuCode,
      wholesalerId: product.wholesalerId,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteOpen = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log(wholesalerId)
    setIsSubmitting(true);
    try {
      if (editingProduct && editingProduct.id) {
        await api.updateProduct(wholesalerId, editingProduct.id, data);
        toast.success("Product updated successfully");
      } else {
        await api.createProduct(wholesalerId, data);
        toast.success("Product created successfully");
      }
      setIsDialogOpen(false);
      revalidator.revalidate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete?.id) return;
    try {
      await api.deleteProduct(wholesalerId, productToDelete.id);
      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
      revalidator.revalidate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!product.id) return;
    try {
      await api.toggleProductStatus(wholesalerId, product.id, !product.isActive);
      toast.success(`Product ${product.isActive ? "deactivated" : "activated"}`);
      revalidator.revalidate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Product Inventory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your catalog, stock levels, and pricing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => revalidator.revalidate()} variant="outline" size="icon" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCreateOpen}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Products"
          value={pagination?.totalItems || 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock"
          value={lowStockProducts}
          icon={AlertCircle}
          color="yellow"
        />
        <StatsCard
          title="Out of Stock"
          value={outOfStockProducts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="flex flex-1 gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus-visible:ring-blue-500 transition-all"
            />
          </div>
          <div className="w-48">
            <Select value={searchParams.get("category") || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-white border-slate-200">
                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "h-8 px-2 transition-all",
              viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "h-8 px-2 transition-all",
              viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No products found</h3>
          <p className="text-slate-500 mt-1 max-w-sm">
            Try adjusting your search or category filter, or add a new product to your inventory.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setSearchParams(new URLSearchParams()); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEditOpen(product)}
                onDelete={() => handleDeleteOpen(product)}
                onToggleStatus={() => handleToggleStatus(product)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* List view implementation */}
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-slate-500 bg-slate-50/50">
                <div className="col-span-4">Product Details</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditOpen(product)}
                  onDelete={() => handleDeleteOpen(product)}
                  onToggleStatus={() => handleToggleStatus(product)}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Pagination Controls */}
      {
        pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-8">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{pagination.totalItems}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm font-medium text-slate-700">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      }

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Make changes to your product details here." : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Basic Info</h3>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Premium Rice" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="skuCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU Code</FormLabel>
                      <FormControl><Input placeholder="SKU-XXXX" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="liter">Liter (L)</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="packet">Packet</SelectItem>
                          <SelectItem value="carton">Carton</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Product details..." className="resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl><Input placeholder="https://..." value={field.value || ""} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? "Saving..." : (editingProduct ? "Save Changes" : "Create Product")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{productToDelete?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div >
  );
}

// Helper Components

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: "blue" | "yellow" | "red" }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-xl border", colorStyles[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCard({ product, onEdit, onDelete, onToggleStatus }: { product: Product; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void }) {
  return (
    <div
      className={cn(
        "group relative bg-white border rounded-xl overflow-hidden hover:shadow-md",
        product.isActive ? "border-slate-200" : "border-slate-100 opacity-75 grayscale-[0.5]"
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Low Stock</Badge>
        )}
        {product.stockQuantity === 0 && (
          <Badge variant="destructive">Out of Stock</Badge>
        )}
        {!product.isActive && (
          <Badge variant="outline" className="bg-slate-100 text-slate-600">Inactive</Badge>
        )}
      </div>

      {/* Action Menu */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-white/90 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              {product.isActive ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {product.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Placeholder or Image */}
      <div className="aspect-4/3 bg-slate-100 relative items-center justify-center flex overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="h-16 w-16 text-slate-300" />
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-slate-900 leading-tight line-clamp-1" title={product.name}>{product.name}</h3>
          <p className="text-xs text-slate-500 mt-1">SKU: {product.skuCode}</p>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">₹{product.price}</p>
            <p className="text-xs text-slate-500">per {product.unit}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-medium", product.stockQuantity > 0 ? "text-slate-700" : "text-red-600")}>
              {product.stockQuantity} in stock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductListItem({ product, onEdit, onDelete, onToggleStatus }: { product: Product; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void }) {
  return (
    <div className={cn(
      "grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-slate-50 group",
      !product.isActive && "opacity-60 bg-slate-50/50"
    )}>
      <div className="col-span-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
          {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <ShoppingBag className="h-5 w-5 text-slate-400" />}
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{product.name}</h4>
          <div className="flex gap-2 text-xs">
            <span className="text-slate-500">SKU: {product.skuCode}</span>
            {!product.isActive && <span className="text-red-500 font-medium">Inactive</span>}
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <Badge variant="outline" className="font-normal">{product.category}</Badge>
      </div>
      <div className="col-span-2 text-slate-700 font-medium">
        ₹{product.price} <span className="text-slate-400 text-xs font-normal">/ {product.unit}</span>
      </div>
      <div className="col-span-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium",
          product.stockQuantity === 0 ? "text-red-600" : product.stockQuantity < 10 ? "text-yellow-600" : "text-green-600"
        )}>
          {product.stockQuantity === 0 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
          {product.stockQuantity}
        </span>
      </div>
      <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggleStatus}>{product.isActive ? "Deactivate" : "Activate"}</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
