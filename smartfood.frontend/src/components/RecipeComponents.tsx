// src/components/RecipeComponents.tsx (hoặc components/recipes/index.tsx tùy cấu trúc)

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ChefHat,
  Clock,
  Users,
  Refrigerator,
  Star,
  Plus,
  X,
  Loader2,
  Check, // Icon Check
  ChevronsUpDown, // Icon ChevronsUpDown
} from "lucide-react";

// Import types cần thiết từ file service (giả định)
import {
  NewRecipeData,
  IngredientItem,
  RecipeData,
  SuggestedRecipe,
} from "@/services/recipeService";

import { FoodInfo, FOOD_SUGGESTIONS } from "../utils/foodSuggestions"; // Sửa đường dẫn cho đúng
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");
// =================================================================
// 1. OverviewCards
// =================================================================
export const OverviewCards = ({
  recipes,
  canMakeRecipesCount,
  smartSuggestedRecipesLength,
  isUserAdmin,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="border border-blue-200 shadow-sm bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Tổng công thức</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">
              {recipes.length}
            </p>
          </div>
          <ChefHat className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>

    {/* ẨN "Có thể nấu ngay" nếu là admin */}
    {!isUserAdmin && (
      <Card className="border border-green-200 shadow-sm bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">
                Có thể nấu ngay
              </p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {canMakeRecipesCount}
              </p>
            </div>
            <Refrigerator className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    )}

    {/* ẨN "Gợi ý thông minh" nếu là admin */}
    {!isUserAdmin && (
      <Card className="border border-purple-200 shadow-sm bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">
                Gợi ý thông minh
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {smartSuggestedRecipesLength}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// =================================================================
// 2. RecipeList
// =================================================================
export const RecipeList = ({
  title,
  description,
  recipesToDisplay,
  suggestedRecipes,
  handleViewRecipeDetail,
  isLoading,
  isUserAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [showAll, setShowAll] = useState(false);
  const initialDisplayLimit = 3;

  const recipesToShow = showAll
    ? recipesToDisplay
    : recipesToDisplay.slice(0, initialDisplayLimit);
  const hasMoreRecipes = recipesToDisplay.length > initialDisplayLimit;

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Đang tải công thức...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="bg-white p-3 border-b border-gray-100">
        <CardTitle className="flex items-center gap-1 text-lg font-semibold text-gray-800">
          {title.includes("Gợi ý thông minh") ? (
            <Star className="h-4 w-4 text-purple-600" />
          ) : (
            <ChefHat className="h-4 w-4 text-gray-700" />
          )}
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {recipesToDisplay.length === 0 ? (
          <p className="text-gray-500 text-center py-3 text-sm">
            Không tìm thấy công thức nào.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipesToShow.map((recipe: RecipeData) => {
                const suggestion: SuggestedRecipe | undefined =
                  suggestedRecipes?.find(
                    (s: SuggestedRecipe) => s._id === recipe._id
                  );
                const availableIngredients =
                  suggestion?.availableIngredients || [];
                const missingIngredients = suggestion?.missingIngredients || [];

                const shortDescription =
                  recipe.description && recipe.description.length > 70
                    ? recipe.description.substring(0, 70) + "..."
                    : recipe.description;

                const difficultyClasses = {
                  Dễ: "bg-green-100 text-green-700 border-green-200",
                  "Trung bình":
                    "bg-yellow-100 text-yellow-700 border-yellow-200",
                  Khó: "bg-red-100 text-red-700 border-red-200",
                };

                return (
                  <Card
                    key={recipe._id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-3xl">{recipe.image}</div>
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {recipe.category}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-gray-900">
                            {recipe.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {shortDescription || "Không có mô tả."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 text-xs">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5"
                          >
                            <Clock className="h-3 w-3" />
                            {recipe.cookTime}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5"
                          >
                            <Users className="h-3 w-3" />
                            {recipe.servings} người
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5"
                          >
                            <Star className="h-3 w-3 text-yellow-500" />
                            {recipe.rating}
                          </Badge>
                          <Badge
                            className={`text-xs px-2 py-0.5 ${difficultyClasses[recipe.difficulty]
                              }`}
                          >
                            {recipe.difficulty}
                          </Badge>
                        </div>

                        {/* HIỂN THỊ THÔNG TIN NGUYÊN LIỆU CÓ SẴN/THIẾU CHỈ KHI CÓ suggestion */}
                        {(availableIngredients.length > 0 ||
                          missingIngredients.length > 0) && (
                            <div className="space-y-1 text-xs p-2 bg-gray-50 rounded-md border border-gray-100">
                              {availableIngredients.length > 0 && (
                                <div>
                                  <p className="font-medium text-green-700 flex items-center gap-1">
                                    <Refrigerator className="h-3 w-3" /> Có sẵn (
                                    {availableIngredients.length}):
                                  </p>
                                  <p className="text-green-600 mt-0.5">
                                    {availableIngredients.slice(0, 2).join(", ")}
                                    {availableIngredients.length > 2 && "..."}
                                  </p>
                                </div>
                              )}
                              {missingIngredients.length > 0 && (
                                <div>
                                  <p className="font-medium text-red-700 flex items-center gap-1">
                                    <Plus className="h-3 w-3" /> Cần mua (
                                    {missingIngredients.length}):
                                  </p>
                                  <p className="text-red-600 mt-0.5">
                                    {missingIngredients.slice(0, 2).join(", ")}
                                    {missingIngredients.length > 2 && "..."}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                        <Button
                          size="sm"
                          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          onClick={() => handleViewRecipeDetail(recipe)}
                        >
                          Xem chi tiết
                        </Button>

                        {/* ADMIN: Thêm nút Sửa và Xóa */}
                        {isUserAdmin && onEdit && onDelete && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                              onClick={() => onEdit(recipe)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => onDelete(recipe._id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {hasMoreRecipes && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="px-4 py-1.5 border-gray-300 hover:bg-gray-100 text-sm"
                >
                  {showAll
                    ? "Thu gọn"
                    : `Xem thêm ${recipesToDisplay.length - initialDisplayLimit
                    } công thức`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// =================================================================
// 3. AddRecipeDialog (CẬP NHẬT TÌM KIẾM NGUYÊN LIỆU)
// =================================================================
export const AddRecipeDialog = ({
  showAddRecipeDialog,
  setShowAddRecipeDialog,
  newRecipeData,
  handleNewRecipeChange,
  handleSelectChange,
  newIngredient,
  setNewIngredient,
  handleAddIngredient,
  handleRemoveIngredient,
  handleCreateRecipe,
  isCreating,
}: {
  showAddRecipeDialog: boolean;
  setShowAddRecipeDialog: (open: boolean) => void;
  newRecipeData: NewRecipeData;
  handleNewRecipeChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  newIngredient: IngredientItem;
  setNewIngredient: React.Dispatch<React.SetStateAction<IngredientItem>>;
  handleAddIngredient: () => void;
  handleRemoveIngredient: (index: number) => void;
  handleCreateRecipe: () => Promise<void>;
  isCreating: boolean;
}) => {
  // ⭐️ CẬP NHẬT: State cho Combobox Nguyên liệu
  const [isIngComboboxOpen, setIsIngComboboxOpen] = useState(false);
  const [ingSearchTerm, setIngSearchTerm] = useState("");

  // ⭐️ CẬP NHẬT: Logic Lọc Gợi ý Nguyên liệu
  const filteredIngSuggestions = useMemo(() => {
    if (!ingSearchTerm) return FOOD_SUGGESTIONS;
    return FOOD_SUGGESTIONS.filter((food) =>
      food.name.toLowerCase().includes(ingSearchTerm.toLowerCase())
    );
  }, [ingSearchTerm]);

  // ⭐️ CẬP NHẬT: Xử lý khi chọn một mục gợi ý Nguyên liệu
  const handleSelectIngFood = (food: FoodInfo) => {
    setNewIngredient((prev) => ({
      ...prev,
      name: food.name,
      unit: food.unit,
    }));
    // Đóng combobox và reset bộ lọc tìm kiếm
    setIsIngComboboxOpen(false);
    setIngSearchTerm("");
  };

  return (
    <Dialog open={showAddRecipeDialog} onOpenChange={setShowAddRecipeDialog}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[85vh] overflow-y-auto p-5 bg-white shadow-xl rounded-lg">
        <DialogHeader className="border-b pb-3 mb-3">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Thêm công thức mới
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Điền thông tin chi tiết cho công thức nấu ăn của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3 md:grid-cols-2 text-sm">
          {/* KHỐI TRÁI (Tên, Mô tả, Hướng dẫn, Hình ảnh, Danh mục) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="name"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Tên công thức
              </Label>
              <Input
                id="name"
                name="name"
                value={newRecipeData.name}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="description"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newRecipeData.description}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 min-h-[60px] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="instructions"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Hướng dẫn
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={newRecipeData.instructions}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 min-h-[100px] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="image"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Hình ảnh (emoji)
              </Label>
              <Input
                id="image"
                name="image"
                value={newRecipeData.image}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: 🍔, 🍕, 🍜"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="category"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Danh mục
              </Label>
              <Input
                id="category"
                name="category"
                value={newRecipeData.category}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: Món chính, Tráng miệng"
              />
            </div>
          </div>

          {/* KHỐI PHẢI (Thời gian, Số người, Độ khó, Nguyên liệu) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="cookTime"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Thời gian nấu
              </Label>
              <Input
                id="cookTime"
                name="cookTime"
                value={newRecipeData.cookTime}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: 30 phút, 1 giờ"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="servings"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Số người ăn
              </Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                value={newRecipeData.servings}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                min="1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="rating"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Đánh giá (0-5)
              </Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                value={newRecipeData.rating}
                onChange={handleNewRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="difficulty"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Độ khó
              </Label>
              <Select
                name="difficulty"
                value={newRecipeData.difficulty}
                onValueChange={(value) =>
                  handleSelectChange("difficulty", value)
                }
              >
                <SelectTrigger className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm">
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  <SelectItem value="Dễ">Dễ</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Khó">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-left font-semibold text-gray-700 block text-xs">
                Nguyên liệu (Tìm kiếm để điền Tên & Đơn vị)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {/* ⭐️ CẬP NHẬT: Tên Nguyên liệu bằng Combobox */}
                <Popover
                  open={isIngComboboxOpen}
                  onOpenChange={setIsIngComboboxOpen}
                >
                  <PopoverTrigger asChild className="sm:col-span-2">
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isIngComboboxOpen}
                      className="w-full justify-between h-9 text-sm"
                    >
                      {newIngredient.name
                        ? newIngredient.name
                        : "Tên nguyên liệu"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50">
                    <Command>
                      <CommandInput
                        placeholder="Tìm kiếm nguyên liệu..."
                        value={ingSearchTerm}
                        onValueChange={setIngSearchTerm}
                      />
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredIngSuggestions.map((food) => (
                            <CommandItem
                              key={food.name}
                              value={food.name}
                              onSelect={() => handleSelectIngFood(food)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newIngredient.name === food.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {food.name}
                              <span className="ml-auto text-xs text-gray-500">
                                ({food.unit})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Số lượng (Giữ nguyên) */}
                <Input
                  type="number"
                  placeholder="Số lượng"
                  value={
                    newIngredient.quantity === 0 ? "" : newIngredient.quantity
                  }
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="sm:col-span-1 border-gray-300 focus:ring-blue-400 text-sm h-9"
                  min="0"
                />

                {/* Đơn vị (Hiện giá trị đã chọn/tự điền) */}
                <Input
                  placeholder="Đơn vị"
                  value={newIngredient.unit}
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  className="sm:col-span-1 border-gray-300 focus:ring-blue-400 text-sm h-9"
                />

                {/* Nút Thêm (Giữ nguyên) */}
                <Button
                  onClick={handleAddIngredient}
                  size="sm"
                  className="sm:col-span-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 h-9"
                >
                  Thêm
                </Button>
              </div>

              {/* Danh sách Nguyên liệu đã thêm (Giữ nguyên) */}
              <div className="space-y-1 mt-1 flex flex-wrap gap-1 p-1.5 bg-gray-50 rounded-md border border-gray-100">
                {newRecipeData.ingredients.length === 0 && (
                  <p className="text-gray-500 text-xs">
                    Chưa có nguyên liệu nào.
                  </p>
                )}
                {newRecipeData.ingredients.map((ing, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center bg-blue-100 text-blue-800 border-blue-200 text-xs"
                  >
                    {ing.name} ({ing.quantity} {ing.unit})
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-blue-600 hover:bg-blue-200"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-3 border-t mt-3">
          <Button
            variant="outline"
            onClick={() => setShowAddRecipeDialog(false)}
            className="px-4 py-1.5 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100 text-sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateRecipe}
            className="px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Tạo công thức"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =================================================================
// 4. RecipeDetailDialog
// =================================================================
export const RecipeDetailDialog = ({
  showRecipeDetailDialog,
  setShowRecipeDetailDialog,
  selectedRecipeDetail,
}: {
  showRecipeDetailDialog: boolean;
  setShowRecipeDetailDialog: (open: boolean) => void;
  selectedRecipeDetail: RecipeData;
}) => (
  <Dialog
    open={showRecipeDetailDialog}
    onOpenChange={setShowRecipeDetailDialog}
  >
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-5 bg-white shadow-xl rounded-lg">
      <DialogHeader className="border-b pb-3 mb-3">
        <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-3xl">{selectedRecipeDetail.image}</span>{" "}
          {selectedRecipeDetail.name}
        </DialogTitle>
        <DialogDescription className="text-gray-600 text-sm mt-1">
          {selectedRecipeDetail.description || "Không có mô tả chi tiết."}
        </DialogDescription>
      </DialogHeader>
      <div className="py-3 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border-gray-200 rounded-md"
          >
            <Clock className="h-3.5 w-3.5" />{" "}
            <span className="font-medium">Thời gian nấu:</span>{" "}
            {selectedRecipeDetail.cookTime}
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border-gray-200 rounded-md"
          >
            <Users className="h-3.5 w-3.5" />{" "}
            <span className="font-medium">Phục vụ:</span>{" "}
            {selectedRecipeDetail.servings} người
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border-gray-200 rounded-md"
          >
            <Star className="h-3.5 w-3.5 text-yellow-500" />{" "}
            <span className="font-medium">Đánh giá:</span>{" "}
            {selectedRecipeDetail.rating} / 5
          </Badge>
          <Badge
            className={`text-xs px-2.5 py-1 rounded-md ${selectedRecipeDetail.difficulty === "Dễ"
              ? "bg-green-100 text-green-700 border-green-200"
              : selectedRecipeDetail.difficulty === "Trung bình"
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-red-100 text-red-700 border-red-200"
              }`}
          >
            <span className="font-medium">Độ khó:</span>{" "}
            {selectedRecipeDetail.difficulty}
          </Badge>
          <Badge
            variant="outline"
            className="px-2.5 py-1 bg-blue-50 text-blue-700 border-blue-200 rounded-md"
          >
            <span className="font-medium">Danh mục:</span>{" "}
            {selectedRecipeDetail.category}
          </Badge>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-2 text-gray-800">Nguyên liệu:</h4>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-0.5">
            {selectedRecipeDetail.ingredients.length === 0 && (
              <p className="text-gray-500 italic text-sm">
                Không có thông tin nguyên liệu.
              </p>
            )}
            {selectedRecipeDetail.ingredients.map((ing, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1.5">•</span>
                <span>
                  <span className="font-semibold">{ing.name}:</span>{" "}
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-2 text-gray-800">Hướng dẫn:</h4>
          <p className="text-gray-700 whitespace-pre-wrap leading-normal text-sm">
            {selectedRecipeDetail.instructions ||
              "Không có hướng dẫn chi tiết."}
          </p>
        </div>
      </div>
      <DialogFooter className="pt-3 border-t mt-3">
        <Button
          onClick={() => setShowRecipeDetailDialog(false)}
          className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Đóng
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// =================================================================
// 5. EditRecipeDialog
// =================================================================
export const EditRecipeDialog = ({
  showEditRecipeDialog,
  setShowEditRecipeDialog,
  editRecipeData,
  handleEditRecipeChange,
  handleSelectChange,
  editIngredient,
  setEditIngredient,
  handleAddIngredient,
  handleRemoveIngredient,
  handleUpdateRecipe,
  isUpdating,
}: {
  showEditRecipeDialog: boolean;
  setShowEditRecipeDialog: (open: boolean) => void;
  editRecipeData: RecipeData;
  handleEditRecipeChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  editIngredient: IngredientItem;
  setEditIngredient: React.Dispatch<React.SetStateAction<IngredientItem>>;
  handleAddIngredient: () => void;
  handleRemoveIngredient: (index: number) => void;
  handleUpdateRecipe: () => Promise<void>;
  isUpdating: boolean;
}) => {
  const [isIngComboboxOpen, setIsIngComboboxOpen] = useState(false);
  const [ingSearchTerm, setIngSearchTerm] = useState("");

  const filteredIngSuggestions = useMemo(() => {
    if (!ingSearchTerm) return FOOD_SUGGESTIONS;
    return FOOD_SUGGESTIONS.filter((food) =>
      food.name.toLowerCase().includes(ingSearchTerm.toLowerCase())
    );
  }, [ingSearchTerm]);

  const handleSelectIngFood = (food: FoodInfo) => {
    setEditIngredient((prev) => ({
      ...prev,
      name: food.name,
      unit: food.unit,
    }));
    setIsIngComboboxOpen(false);
    setIngSearchTerm("");
  };

  return (
    <Dialog open={showEditRecipeDialog} onOpenChange={setShowEditRecipeDialog}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[85vh] overflow-y-auto p-5 bg-white shadow-xl rounded-lg">
        <DialogHeader className="border-b pb-3 mb-3">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Sửa công thức
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Cập nhật thông tin chi tiết cho công thức nấu ăn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3 md:grid-cols-2 text-sm">
          {/* KHỐI TRÁI */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="name"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Tên công thức
              </Label>
              <Input
                id="name"
                name="name"
                value={editRecipeData.name}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="description"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={editRecipeData.description}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 min-h-[60px] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="instructions"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Hướng dẫn
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={editRecipeData.instructions}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 min-h-[100px] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="image"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Hình ảnh (emoji)
              </Label>
              <Input
                id="image"
                name="image"
                value={editRecipeData.image}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: 🍔, 🍕, 🍜"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="category"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Danh mục
              </Label>
              <Input
                id="category"
                name="category"
                value={editRecipeData.category}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: Món chính, Tráng miệng"
              />
            </div>
          </div>

          {/* KHỐI PHẢI */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="cookTime"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Thời gian nấu
              </Label>
              <Input
                id="cookTime"
                name="cookTime"
                value={editRecipeData.cookTime}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                placeholder="Ex: 30 phút, 1 giờ"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="servings"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Số người ăn
              </Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                value={editRecipeData.servings}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                min="1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="rating"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Đánh giá (0-5)
              </Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                value={editRecipeData.rating}
                onChange={handleEditRecipeChange}
                className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-1.5">
              <Label
                htmlFor="difficulty"
                className="md:col-span-1 text-left md:text-right font-medium text-gray-700 text-xs"
              >
                Độ khó
              </Label>
              <Select
                name="difficulty"
                value={editRecipeData.difficulty}
                onValueChange={(value) =>
                  handleSelectChange("difficulty", value)
                }
              >
                <SelectTrigger className="md:col-span-3 border-gray-300 focus:ring-blue-400 text-sm">
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  <SelectItem value="Dễ">Dễ</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Khó">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-left font-semibold text-gray-700 block text-xs">
                Nguyên liệu (Tìm kiếm để điền Tên & Đơn vị)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <Popover
                  open={isIngComboboxOpen}
                  onOpenChange={setIsIngComboboxOpen}
                >
                  <PopoverTrigger asChild className="sm:col-span-2">
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isIngComboboxOpen}
                      className="w-full justify-between h-9 text-sm"
                    >
                      {editIngredient.name
                        ? editIngredient.name
                        : "Tên nguyên liệu"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50">
                    <Command>
                      <CommandInput
                        placeholder="Tìm kiếm nguyên liệu..."
                        value={ingSearchTerm}
                        onValueChange={setIngSearchTerm}
                      />
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredIngSuggestions.map((food) => (
                            <CommandItem
                              key={food.name}
                              value={food.name}
                              onSelect={() => handleSelectIngFood(food)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  editIngredient.name === food.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {food.name}
                              <span className="ml-auto text-xs text-gray-500">
                                ({food.unit})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Input
                  type="number"
                  placeholder="Số lượng"
                  value={
                    editIngredient.quantity === 0 ? "" : editIngredient.quantity
                  }
                  onChange={(e) =>
                    setEditIngredient((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="sm:col-span-1 border-gray-300 focus:ring-blue-400 text-sm h-9"
                  min="0"
                />

                <Input
                  placeholder="Đơn vị"
                  value={editIngredient.unit}
                  onChange={(e) =>
                    setEditIngredient((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  className="sm:col-span-1 border-gray-300 focus:ring-blue-400 text-sm h-9"
                />

                <Button
                  onClick={handleAddIngredient}
                  size="sm"
                  className="sm:col-span-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 h-9"
                >
                  Thêm
                </Button>
              </div>

              <div className="space-y-1 mt-1 flex flex-wrap gap-1 p-1.5 bg-gray-50 rounded-md border border-gray-100">
                {editRecipeData.ingredients.length === 0 && (
                  <p className="text-gray-500 text-xs">
                    Chưa có nguyên liệu nào.
                  </p>
                )}
                {editRecipeData.ingredients.map((ing, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center bg-blue-100 text-blue-800 border-blue-200 text-xs"
                  >
                    {ing.name} ({ing.quantity} {ing.unit})
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-blue-600 hover:bg-blue-200"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-3 border-t mt-3">
          <Button
            variant="outline"
            onClick={() => setShowEditRecipeDialog(false)}
            className="px-4 py-1.5 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100 text-sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateRecipe}
            className="px-4 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-sm"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Cập nhật công thức"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
