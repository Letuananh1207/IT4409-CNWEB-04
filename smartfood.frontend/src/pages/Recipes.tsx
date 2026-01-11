// src/pages/Recipes.tsx (hoặc src/Recipes.tsx)

import { useState, useEffect, useMemo } from "react";
// Import các UI component cần thiết
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChefHat, Plus, Loader2 } from "lucide-react";

// REACT QUERY IMPORTS
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getRecipes,
  getSuggestedRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  NewRecipeData,
  IngredientItem,
  RecipeData,
  SuggestedRecipe,
} from "@/services/recipeService";
import { getUserInfo } from "../utils/auth";

// ⭐️ CẬP NHẬT: Import các component con đã tách
import {
  OverviewCards,
  RecipeList,
  AddRecipeDialog,
  RecipeDetailDialog,
  EditRecipeDialog,
} from "../components/RecipeComponents";

// ⭐️ KHAI BÁO QUERY KEY CỦA TỦ LẠNH (Giả định, phải khớp với Fridge component)
const FRIDGE_ITEMS_QUERY_KEY = "fridgeItems";

const Recipes = () => {
  const queryClient = useQueryClient();

  // ... (Local States - Giữ nguyên)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showAddRecipeDialog, setShowAddRecipeDialog] = useState(false);
  const [newRecipeData, setNewRecipeData] = useState<NewRecipeData>({
    name: "",
    description: "",
    image: "🍳",
    cookTime: "",
    servings: 1,
    rating: 0,
    difficulty: "Dễ",
    ingredients: [],
    instructions: "",
    category: "",
  });
  const [newIngredient, setNewIngredient] = useState<IngredientItem>({
    name: "",
    quantity: 0,
    unit: "",
  });

  const [showRecipeDetailDialog, setShowRecipeDetailDialog] = useState(false);
  const [selectedRecipeDetail, setSelectedRecipeDetail] =
    useState<RecipeData | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  // --- Edit Recipe States ---
  const [showEditRecipeDialog, setShowEditRecipeDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeData | null>(null);
  const [editIngredient, setEditIngredient] = useState<IngredientItem>({
    name: "",
    quantity: 0,
    unit: "",
  });

  // --- ⭐️ CẬP NHẬT MỚI: Lấy trạng thái dữ liệu tủ lạnh ---
  // Chúng ta không cần đọc data, chỉ cần theo dõi thời điểm nó được cập nhật
  const fridgeDataState = queryClient.getQueryState([FRIDGE_ITEMS_QUERY_KEY]);

  // --- React Query Queries ---

  const recipeQueryKey = [
    "recipes",
    { search: searchTerm, difficulty: selectedDifficulty },
  ];

  // 1. Fetch All/Filtered Recipes (Giữ nguyên)
  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    isFetching: isFetchingRecipes,
    error: recipeError,
  } = useQuery<RecipeData[]>({
    queryKey: recipeQueryKey,
    queryFn: () =>
      getRecipes({
        search: searchTerm,
        difficulty:
          selectedDifficulty === "all" ? undefined : selectedDifficulty,
      }),
    placeholderData: (previousData) => previousData,
  });

  // 2. Fetch Suggested Recipes
  // ⭐️ CẬP NHẬT: Thêm một biến trạng thái làm dependency key
  const suggestionQueryKey = [
    "suggestedRecipes",
    fridgeDataState?.dataUpdatedAt,
  ];

  const {
    data: suggestedRecipes = [],
    isLoading: isLoadingSuggestions,
    error: suggestionError,
  } = useQuery<SuggestedRecipe[]>({
    queryKey: suggestionQueryKey, // SỬ DỤNG KEY CÓ THỜI GIAN CẬP NHẬT CỦA TỦ LẠNH
    queryFn: getSuggestedRecipes,
    enabled: userRole !== "admin" && userRole !== null,
    staleTime: 1000 * 60 * 10,
  });

  // --- Fetch User Role (Giữ nguyên) ---
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.role) {
      setUserRole(userInfo.role);
    } else {
      setUserRole(null);
    }
  }, []);

  // --- Computed Data ---
  const isUserAdmin = userRole === "admin";
  const isComponentLoading =
    isFetchingRecipes || isLoadingRecipes || userRole === null;

  // Tính toán số lượng công thức gợi ý (Gộp Nấu ngay & Thiếu ít)
  const smartSuggestedRecipes = useMemo(() => {
    return isUserAdmin
      ? []
      : suggestedRecipes.filter((item) => item.missingIngredients.length <= 2);
  }, [suggestedRecipes, isUserAdmin]);

  // Tính toán riêng số lượng có thể nấu ngay (cho Overview)
  const canMakeRecipesCount = useMemo(() => {
    return isUserAdmin
      ? 0
      : suggestedRecipes.filter((item) => item.missingIngredients.length === 0)
        .length;
  }, [suggestedRecipes, isUserAdmin]);

  // --- Mutation: Create Recipe (Giữ nguyên) ---
  const createRecipeMutation = useMutation({
    mutationFn: (recipeData: NewRecipeData) => createRecipe(recipeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      // ⭐️ CẦN REFETCH SUGGESTED RECIPES SAU KHI TẠO RECIPE MỚI
      queryClient.invalidateQueries({ queryKey: ["suggestedRecipes"] });

      // Reset form và đóng dialog
      setNewRecipeData({
        name: "",
        description: "",
        image: "🍳",
        cookTime: "",
        servings: 1,
        rating: 0,
        difficulty: "Dễ",
        ingredients: [],
        instructions: "",
        category: "",
      });
      setShowAddRecipeDialog(false);
    },
    onError: (error: any) => {
      console.error("Lỗi khi tạo công thức:", error);
      alert(`Lỗi khi tạo công thức: ${error.message || "Có lỗi xảy ra"}`);
    },
  });

  // --- Mutation: Update Recipe ---
  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewRecipeData> }) =>
      updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedRecipes"] });
      setShowEditRecipeDialog(false);
      setEditingRecipe(null);
    },
    onError: (error: any) => {
      console.error("Lỗi khi cập nhật công thức:", error);
      alert(`Lỗi khi cập nhật công thức: ${error.message || "Có lỗi xảy ra"}`);
    },
  });

  // --- Mutation: Delete Recipe ---
  const deleteRecipeMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedRecipes"] });
    },
    onError: (error: any) => {
      console.error("Lỗi khi xóa công thức:", error);
      alert(`Lỗi khi xóa công thức: ${error.message || "Có lỗi xảy ra"}`);
    },
  });

  // ... (Handlers - Giữ nguyên)
  const handleNewRecipeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    if (
      newIngredient.name &&
      newIngredient.quantity > 0 &&
      newIngredient.unit
    ) {
      setNewRecipeData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient],
      }));
      setNewIngredient({ name: "", quantity: 0, unit: "" });
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setNewRecipeData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleCreateRecipe = async () => {
    const recipeToCreate: NewRecipeData = {
      ...newRecipeData,
      servings: Number(newRecipeData.servings),
      rating: Number(newRecipeData.rating),
    };
    createRecipeMutation.mutate(recipeToCreate);
  };

  const handleViewRecipeDetail = (recipe: RecipeData) => {
    setSelectedRecipeDetail(recipe);
    setShowRecipeDetailDialog(true);
  };

  // --- Edit Recipe Handlers ---
  const handleEditRecipe = (recipe: RecipeData) => {
    setEditingRecipe(recipe);
    setShowEditRecipeDialog(true);
  };

  const handleEditRecipeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingRecipe) return;
    const { name, value } = e.target;
    setEditingRecipe((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    if (!editingRecipe) return;
    setEditingRecipe((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleEditAddIngredient = () => {
    if (
      !editingRecipe ||
      !editIngredient.name ||
      editIngredient.quantity <= 0 ||
      !editIngredient.unit
    )
      return;
    setEditingRecipe((prev) =>
      prev
        ? {
          ...prev,
          ingredients: [...prev.ingredients, editIngredient],
        }
        : prev
    );
    setEditIngredient({ name: "", quantity: 0, unit: "" });
  };

  const handleEditRemoveIngredient = (indexToRemove: number) => {
    if (!editingRecipe) return;
    setEditingRecipe((prev) =>
      prev
        ? {
          ...prev,
          ingredients: prev.ingredients.filter(
            (_, index) => index !== indexToRemove
          ),
        }
        : prev
    );
  };

  const handleUpdateRecipe = async () => {
    if (!editingRecipe) return;
    const recipeToUpdate: Partial<NewRecipeData> = {
      name: editingRecipe.name,
      description: editingRecipe.description,
      image: editingRecipe.image,
      cookTime: editingRecipe.cookTime,
      servings: Number(editingRecipe.servings),
      rating: Number(editingRecipe.rating),
      difficulty: editingRecipe.difficulty,
      ingredients: editingRecipe.ingredients,
      instructions: editingRecipe.instructions,
      category: editingRecipe.category,
    };
    updateRecipeMutation.mutate({ id: editingRecipe._id, data: recipeToUpdate });
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công thức này không?")) {
      deleteRecipeMutation.mutate(id);
    }
  };
  // ... (End Handlers)

  // Hiển thị loading trong khi chờ vai trò người dùng được xác định
  if (userRole === null) {
    return (
      <div className="p-6 text-center text-gray-600 text-sm">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  // Hiển thị loading khi fetch lần đầu (chỉ khi chưa có data)
  if (isLoadingRecipes && recipes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600 text-sm">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        Đang tải công thức...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          Kho Công thức
        </h1>
        {/* --- NÚT THÊM CÔNG THỨC MỚI (CHỈ HIỂN THỊ CHO ADMIN) --- */}
        {isUserAdmin && (
          <Button
            onClick={() => setShowAddRecipeDialog(true)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm công thức mới
          </Button>
        )}
      </div>
      <p className="text-base text-gray-700 border-b pb-3 border-gray-200">
        Khám phá và quản lý bộ sưu tập công thức nấu ăn phong phú của bạn.
      </p>

      {/* Overview Cards */}
      <OverviewCards
        recipes={recipes}
        canMakeRecipesCount={canMakeRecipesCount}
        smartSuggestedRecipesLength={smartSuggestedRecipes.length}
        isUserAdmin={isUserAdmin}
      />

      {/* Smart Suggested Recipes Section */}
      {userRole !== "admin" && (
        <RecipeList
          title="Gợi ý thông minh (Nấu ngay & Thiếu ít nguyên liệu)"
          description={`Tìm thấy ${smartSuggestedRecipes.length
            } món có thể nấu ngay hoặc chỉ cần mua thêm tối đa 2 nguyên liệu. ${isLoadingSuggestions ? "(Đang cập nhật nguyên liệu...)" : ""
            }`}
          recipesToDisplay={
            recipes.filter((recipe) =>
              smartSuggestedRecipes.some(
                (suggestion) => suggestion._id === recipe._id
              )
            ) as RecipeData[]
          }
          suggestedRecipes={suggestedRecipes}
          handleViewRecipeDetail={handleViewRecipeDetail}
          isLoading={isLoadingSuggestions && suggestedRecipes.length === 0}
          isUserAdmin={isUserAdmin}
          onEdit={handleEditRecipe}
          onDelete={handleDeleteRecipe}
        />
      )}

      {/* Search and Filter Section */}
      <Card className="border border-yellow-200 shadow-sm bg-yellow-50">
        {/* ⭐️ CardContent đã được import ở đầu file */}
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-600" />
              <Input
                placeholder="Tìm kiếm công thức theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border border-yellow-300 focus:ring-yellow-400 bg-white"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-center">
              {["all", "Dễ", "Trung bình", "Khó"].map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={
                    selectedDifficulty === difficulty ? "default" : "outline"
                  }
                  size="sm"
                  className={`px-3 py-1.5 rounded-md ${selectedDifficulty === difficulty
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    }`}
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty === "all" ? "Tất cả" : difficulty}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Recipes Section */}
      <RecipeList
        title="Tất cả công thức"
        description={`${recipes.length} công thức được tìm thấy.`}
        recipesToDisplay={recipes}
        suggestedRecipes={suggestedRecipes}
        handleViewRecipeDetail={handleViewRecipeDetail}
        isLoading={isComponentLoading && recipes.length === 0}
        isUserAdmin={isUserAdmin}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteRecipe}
      />

      {/* Dialog Thêm công thức mới */}
      <AddRecipeDialog
        showAddRecipeDialog={showAddRecipeDialog}
        setShowAddRecipeDialog={setShowAddRecipeDialog}
        newRecipeData={newRecipeData}
        handleNewRecipeChange={handleNewRecipeChange}
        handleSelectChange={handleSelectChange}
        newIngredient={newIngredient}
        setNewIngredient={setNewIngredient}
        handleAddIngredient={handleAddIngredient}
        handleRemoveIngredient={handleRemoveIngredient}
        handleCreateRecipe={handleCreateRecipe}
        isCreating={createRecipeMutation.isPending}
      />

      {/* Dialog hiển thị chi tiết công thức */}
      {selectedRecipeDetail && (
        <RecipeDetailDialog
          showRecipeDetailDialog={showRecipeDetailDialog}
          setShowRecipeDetailDialog={setShowRecipeDetailDialog}
          selectedRecipeDetail={selectedRecipeDetail}
        />
      )}

      {/* Dialog sửa công thức */}
      {editingRecipe && (
        <EditRecipeDialog
          showEditRecipeDialog={showEditRecipeDialog}
          setShowEditRecipeDialog={setShowEditRecipeDialog}
          editRecipeData={editingRecipe}
          handleEditRecipeChange={handleEditRecipeChange}
          handleSelectChange={handleEditSelectChange}
          editIngredient={editIngredient}
          setEditIngredient={setEditIngredient}
          handleAddIngredient={handleEditAddIngredient}
          handleRemoveIngredient={handleEditRemoveIngredient}
          handleUpdateRecipe={handleUpdateRecipe}
          isUpdating={updateRecipeMutation.isPending}
        />
      )}
    </div>
  );
};

export default Recipes;
