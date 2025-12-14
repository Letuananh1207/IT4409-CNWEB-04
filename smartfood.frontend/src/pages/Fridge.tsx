import { useState, useMemo } from "react";
// ⭐️ IMPORT REACT QUERY HOOKS
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// IMPORT THÊM: Command (cho combobox/autocomplete)
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Plus,
  Refrigerator,
  AlertTriangle,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  Loader2,
  Pencil,
  Save,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Giả định bạn có utility class cn
import { units } from "../utils/units";

// Import API service và interface
import {
  getFoodItems,
  createFoodItem,
  deleteFoodItem,
  updateFoodItem,
  FoodItemData,
} from "@/services/foodItemService";

// ⭐️ CẬP NHẬT: Import FoodInfo và FOOD_SUGGESTIONS từ file riêng
import { FoodInfo, FOOD_SUGGESTIONS } from "@/utils/foodSuggestions";

// Định nghĩa kiểu dữ liệu cho Food Item trong frontend (Giữ nguyên)
interface FridgeItem extends FoodItemData {
  _id: string;
  expiryDate: Date; // Đã parse thành Date object
  createdAt: Date; // Đã parse thành Date object
  updatedAt: Date; // Đã parse thành Date object
}

// Định nghĩa Query Key
const FRIDGE_ITEMS_QUERY_KEY = "fridgeItems";
// Định nghĩa thời gian cache (ví dụ: 5 phút stale time, 1 giờ cache time)
const FIVE_MINUTES = 1000 * 60 * 5; // 300000 ms
const ONE_HOUR = 1000 * 60 * 60; // 3600000 ms

const Fridge = () => {
  const queryClient = useQueryClient();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(0);

  // Giữ nguyên State cho Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State cho form
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "", // Vẫn là string
    unit: "", // Sẽ được điền tự động
    category: "", // Sẽ được điền tự động
    storageLocation: "",
    expiryDate: undefined as Date | undefined,
  });

  // State cho Combobox/Autocomplete
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [foodSearchTerm, setFoodSearchTerm] = useState("");

  // Logic Lọc Gợi ý
  const filteredSuggestions = useMemo(() => {
    if (!foodSearchTerm) return FOOD_SUGGESTIONS;
    return FOOD_SUGGESTIONS.filter((food) =>
      food.name.toLowerCase().includes(foodSearchTerm.toLowerCase())
    );
  }, [foodSearchTerm]);

  // Xử lý khi chọn một mục gợi ý (Không có toast)
  const handleSelectFood = (food: FoodInfo) => {
    // 1. Điền Tên, Đơn vị, Danh mục
    setNewItem((prev) => ({
      ...prev,
      name: food.name,
      unit: food.unit,
      category: food.category,
    }));
    // 2. Đóng combobox và reset bộ lọc tìm kiếm
    setIsComboboxOpen(false);
    setFoodSearchTerm("");
  };

  // Data/Config cố định (Giữ nguyên)
  const categories = [
    "Rau củ",
    "Thịt cá",
    "Sữa & trứng",
    "Đồ khô",
    "Gia vị",
    "Đồ uống",
    "Đồ đông lạnh",
    "Khác",
  ];

  const locations = ["Tủ đông", "Ngăn rau củ", "Cửa tủ lạnh"];

  // --- 1. Lấy dữ liệu (READ) bằng useQuery (Giữ nguyên) ---
  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: [FRIDGE_ITEMS_QUERY_KEY],
    queryFn: async () => {
      const data = await getFoodItems();
      return data.map((item) => ({
        ...item,
        _id: item._id!,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt!),
        updatedAt: new Date(item.updatedAt!),
      })) as FridgeItem[];
    },
    staleTime: FIVE_MINUTES,
    gcTime: ONE_HOUR,
  });

  const fridgeItems: FridgeItem[] = items || [];
  const totalItems = fridgeItems.length;

  // --- 2. Thao tác Thêm (CREATE) bằng useMutation (Giữ nguyên) ---
  const addItemMutation = useMutation({
    mutationFn: createFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FRIDGE_ITEMS_QUERY_KEY] });

      // Reset form, bao gồm cả các trường tự điền
      setNewItem({
        name: "",
        quantity: "",
        unit: "",
        category: "",
        storageLocation: "",
        expiryDate: undefined,
      });
      toast({
        title: "Đã thêm thực phẩm",
        description: "Thực phẩm đã được thêm vào tủ lạnh.",
      });
    },
    onError: (err: any) => {
      console.error("Lỗi khi thêm thực phẩm:", err);
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể thêm thực phẩm.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    // Logic kiểm tra cũ (Đã cập nhật kiểm tra trường)
    if (
      !newItem.name ||
      !newItem.quantity ||
      !newItem.unit ||
      !newItem.storageLocation ||
      !newItem.expiryDate
    ) {
      toast({
        title: "Thiếu thông tin",
        description:
          "Vui lòng điền đủ Tên, Số lượng, Đơn vị, Vị trí và Ngày hết hạn.",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseFloat(newItem.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Số lượng không hợp lệ",
        description: "Vui lòng nhập số lượng là một số dương.",
        variant: "destructive",
      });
      return;
    }

    // Chuẩn bị dữ liệu gửi đi
    const foodItemToSend: Omit<
      FoodItemData,
      "_id" | "createdAt" | "updatedAt" | "isExpired"
    > = {
      name: newItem.name,
      quantity: quantityNum,
      unit: newItem.unit,
      category: newItem.category || "Khác", // Gán mặc định nếu không có category
      storageLocation: newItem.storageLocation,
      expiryDate: newItem.expiryDate.toISOString(), // Chuyển Date object thành ISO string
    };

    addItemMutation.mutate(foodItemToSend); // Kích hoạt mutation
  };

  // --- 3. Thao tác Xóa (DELETE) bằng useMutation (Giữ nguyên) ---
  const deleteItemMutation = useMutation({
    mutationFn: deleteFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FRIDGE_ITEMS_QUERY_KEY] });
      setEditingItemId(null);
      toast({
        title: "Đã xóa thực phẩm",
        description: "Thực phẩm đã được xóa khỏi tủ lạnh.",
      });
    },
    onError: (err: any) => {
      console.error("Lỗi khi xóa thực phẩm:", err);
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể xóa thực phẩm.",
        variant: "destructive",
      });
    },
  });

  const deleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  // ----------------------------------------------------
  // CẬP NHẬT: Thao tác Cập nhật Số lượng (UPDATE) (Giữ nguyên)
  // ----------------------------------------------------

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateFoodItem(id, { quantity }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [FRIDGE_ITEMS_QUERY_KEY] });
      setEditingItemId(null);
      if (variables.quantity > 0) {
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật số lượng của ${
            data.name || "thực phẩm"
          } thành ${data.quantity} ${data.unit}.`,
        });
      }
    },
    onError: (err: any) => {
      console.error("Lỗi khi cập nhật số lượng:", err);
      toast({
        title: "Lỗi",
        description:
          err.response?.data?.message || "Không thể cập nhật số lượng.",
        variant: "destructive",
      });
    },
  });

  const startEditing = (item: FridgeItem) => {
    setEditingItemId(item._id);
    setTempQuantity(item.quantity);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setTempQuantity(0);
  };

  const saveQuantityChange = (itemId: string, currentItem: FridgeItem) => {
    const newQuantity = tempQuantity;

    if (newQuantity < 0 || isNaN(newQuantity)) {
      toast({
        title: "Lỗi đầu vào",
        description: "Số lượng phải là một số dương.",
        variant: "destructive",
      });
      return;
    }

    if (newQuantity === currentItem.quantity) {
      toast({
        title: "Không có thay đổi",
        description: "Số lượng mới giống số lượng cũ.",
      });
      setEditingItemId(null);
      return;
    }

    if (newQuantity === 0) {
      deleteItem(itemId);
      return;
    }

    updateQuantityMutation.mutate({ id: itemId, quantity: newQuantity });
  };

  const adjustQuantity = (currentQuantity: number, change: number) => {
    const newQuantity = parseFloat((currentQuantity + change).toFixed(2));
    if (newQuantity >= 0) {
      setTempQuantity(newQuantity);
    }
  };

  const handleManualQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const newQuantity = parseFloat(value);

    if (value === "") {
      setTempQuantity(0);
    } else if (!isNaN(newQuantity) && newQuantity >= 0) {
      setTempQuantity(newQuantity);
    }
  };

  // --- Logic tính toán ngày hết hạn và trạng thái (Giữ nguyên) ---
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0)
      return { status: "expired", label: "Đã hết hạn", color: "destructive" };
    if (days === 0)
      return {
        status: "today",
        label: "Hết hạn hôm nay",
        color: "destructive",
      };
    if (days <= 3)
      return {
        status: "warning",
        label: `Còn ${days} ngày`,
        color: "destructive",
      };
    if (days <= 7)
      return { status: "soon", label: `Còn ${days} ngày`, color: "default" };
    return { status: "good", label: `Còn ${days} ngày`, color: "secondary" };
  };

  // --- Lọc và tìm kiếm (Giữ nguyên) ---
  const filteredItems = fridgeItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const expiringItems = fridgeItems.filter(
    (item) =>
      getDaysUntilExpiry(item.expiryDate) <= 3 &&
      getDaysUntilExpiry(item.expiryDate) >= 0
  );

  // --- Hiển thị Trạng thái Loading/Error (Giữ nguyên) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-gray-700">
          Đang tải thực phẩm từ tủ lạnh...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-xl">
          Đã xảy ra lỗi: {error.message || "Không thể tải dữ liệu."}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: [FRIDGE_ITEMS_QUERY_KEY],
            })
          }
          className="mt-4"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // --- JSX (Phần hiển thị chính) ---
  return (
    <div className="space-y-8">
      {/* ... (Header, Quick Stats - Giữ nguyên) ... */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Refrigerator className="h-8 w-8 text-primary" />
          Quản lý tủ lạnh
        </h1>
        <p className="text-lg text-gray-600">
          Theo dõi thực phẩm trong tủ lạnh và hạn sử dụng
        </p>
      </div>

      {/* Quick Stats (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng thực phẩm
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Refrigerator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                <p className="text-3xl font-bold text-orange-600">
                  {expiringItems.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục</p>
                <p className="text-3xl font-bold text-green-600">
                  {new Set(fridgeItems.map((item) => item.category)).size}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">🥬</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Item - PHẦN THÊM MỚI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Thêm thực phẩm mới
          </CardTitle>
          <CardDescription>
            Tìm kiếm thực phẩm để tự động điền Đơn vị và Danh mục.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tên thực phẩm bằng Combobox */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="name">Tên thực phẩm (Tìm kiếm & Chọn)</Label>
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    className="w-full justify-between"
                    disabled={addItemMutation.isPending}
                  >
                    {newItem.name ? newItem.name : "Tìm kiếm thực phẩm..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    {/* Input tìm kiếm trong Popover */}
                    <CommandInput
                      placeholder="Tìm kiếm thực phẩm..."
                      value={foodSearchTerm}
                      onValueChange={setFoodSearchTerm}
                    />
                    <CommandEmpty>Không tìm thấy thực phẩm.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {filteredSuggestions.map((food) => (
                          <CommandItem
                            key={food.name}
                            value={food.name}
                            onSelect={() => handleSelectFood(food)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newItem.name === food.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {food.name}
                            <span className="ml-auto text-xs text-gray-500">
                              ({food.unit} - {food.category})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* END Tên thực phẩm bằng Combobox */}

            {/* Số lượng */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Ví dụ: 500"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
                disabled={addItemMutation.isPending}
              />
            </div>

            {/* Đơn vị (Có thể chỉnh sửa sau khi tự điền) */}
            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Select
                value={newItem.unit}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, unit: value })
                }
                disabled={!newItem.name || addItemMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Danh mục (Readonly) */}
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục (Tự động điền)</Label>
              <Input
                id="category"
                value={newItem.category || "Chưa chọn"}
                disabled
                className="font-medium bg-gray-50 text-gray-700"
              />
            </div>

            {/* Vị trí lưu trữ (Giữ nguyên) */}
            <div className="space-y-2">
              <Label htmlFor="storageLocation">Vị trí lưu trữ</Label>
              <Select
                value={newItem.storageLocation}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, storageLocation: value })
                }
                disabled={addItemMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ngày hết hạn (Giữ nguyên) */}
            <div className="space-y-2">
              <Label>Ngày hết hạn</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={addItemMutation.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newItem.expiryDate
                      ? format(newItem.expiryDate, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newItem.expiryDate}
                    onSelect={(date) =>
                      setNewItem({ ...newItem, expiryDate: date })
                    }
                    initialFocus
                    locale={vi}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* Nút Thêm */}
          <Button
            onClick={addItem}
            className="w-full"
            disabled={addItemMutation.isPending}
          >
            {addItemMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Thêm vào tủ lạnh
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter (Giữ nguyên) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm thực phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fridge Items - PHẦN HIỂN THỊ (Giữ nguyên) */}
      <Card>
        <CardHeader>
          <CardTitle>Thực phẩm trong tủ lạnh</CardTitle>
          <CardDescription>
            {filteredItems.length} thực phẩm được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Refrigerator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy thực phẩm nào</p>
                <p className="text-sm">
                  Thử thay đổi bộ lọc hoặc thêm thực phẩm mới
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const expiryStatus = getExpiryStatus(item.expiryDate);
                const isEditing = editingItemId === item._id;
                const isUpdating =
                  updateQuantityMutation.isPending &&
                  updateQuantityMutation.variables?.id === item._id;
                const isDeleting =
                  deleteItemMutation.isPending &&
                  deleteItemMutation.variables === item._id;

                return (
                  <div
                    key={item._id}
                    className="p-4 border rounded-lg bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg truncate">
                            {item.name}
                          </h4>
                          <Badge variant={expiryStatus.color as any}>
                            {expiryStatus.status === "expired"
                              ? "Hết hạn"
                              : expiryStatus.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Danh mục:</span>{" "}
                            {item.category || "Chưa phân loại"}
                          </div>
                          <div>
                            <span className="font-medium">Vị trí:</span>{" "}
                            {item.storageLocation}
                          </div>
                          <div>
                            <span className="font-medium">Hết hạn:</span>{" "}
                            {format(item.expiryDate, "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </div>

                          {/* Hiển thị/Chế độ chỉnh sửa Số lượng */}
                          <div className="col-span-2 lg:col-span-1 flex items-center gap-2">
                            <span className="font-medium">SL:</span>
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 p-0"
                                  onClick={() =>
                                    adjustQuantity(tempQuantity, -1)
                                  }
                                  disabled={isUpdating || tempQuantity <= 0}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={tempQuantity.toString()}
                                  onChange={handleManualQuantityChange}
                                  className="w-16 h-8 text-center"
                                  disabled={isUpdating}
                                />
                                <span className="text-sm font-medium text-gray-800 flex-shrink-0">
                                  {item.unit}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 p-0"
                                  onClick={() =>
                                    adjustQuantity(tempQuantity, 1)
                                  }
                                  disabled={isUpdating}
                                >
                                  +
                                </Button>
                              </>
                            ) : (
                              <span className="font-bold text-gray-800">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nút Chỉnh sửa/Lưu/Hủy */}
                      <div className="flex gap-2 flex-shrink-0">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveQuantityChange(item._id, item)}
                              disabled={isUpdating || isDeleting}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              Lưu
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              disabled={isUpdating || isDeleting}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(item)}
                            disabled={isUpdating || isDeleting}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Nút xóa (Giữ nguyên) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item._id!)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isDeleting || isUpdating || isEditing}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fridge;
