import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

// Category และ Subcategory data
const CATEGORIES = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    subcategories: [
      { id: "smartphones", name: "Smartphones & Tablets", icon: "📱" },
      { id: "computers", name: "Computers & Laptops", icon: "💻" },
      { id: "cameras", name: "Cameras & Photography", icon: "📷" },
      { id: "audio", name: "Audio & Headphones", icon: "🎧" },
      { id: "gaming", name: "Gaming & Consoles", icon: "🎮" },
      { id: "wearables", name: "Wearables & Smartwatches", icon: "⌚" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    subcategories: [
      { id: "mens", name: "Men's Clothing", icon: "👔" },
      { id: "womens", name: "Women's Clothing", icon: "👗" },
      { id: "shoes", name: "Shoes & Footwear", icon: "👟" },
      { id: "accessories", name: "Accessories", icon: "👜" },
      { id: "watches", name: "Watches", icon: "⌚" },
    ],
  },
  {
    id: "collectibles",
    name: "Collectibles",
    icon: "🎨",
    subcategories: [
      { id: "art", name: "Art & Paintings", icon: "🖼️" },
      { id: "toys", name: "Toys & Figures", icon: "🧸" },
      { id: "cards", name: "Trading Cards", icon: "🃏" },
      { id: "coins", name: "Coins & Currency", icon: "🪙" },
      { id: "antiques", name: "Antiques", icon: "🏺" },
    ],
  },
  {
    id: "home",
    name: "Home",
    icon: "🏠",
    subcategories: [
      { id: "furniture", name: "Furniture", icon: "🛋️" },
      { id: "decor", name: "Home Decor", icon: "🖼️" },
      { id: "kitchen", name: "Kitchen & Dining", icon: "🍽️" },
      { id: "garden", name: "Garden & Outdoor", icon: "🌱" },
      { id: "appliances", name: "Appliances", icon: "🔌" },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚗",
    subcategories: [
      { id: "cars", name: "Cars", icon: "🚗" },
      { id: "motorcycles", name: "Motorcycles", icon: "🏍️" },
      { id: "boats", name: "Boats", icon: "⛵" },
      { id: "parts", name: "Auto Parts", icon: "🔧" },
    ],
  },
  {
    id: "others",
    name: "Others",
    icon: "📦",
    subcategories: [
      { id: "books", name: "Books & Magazines", icon: "📚" },
      { id: "sports", name: "Sports & Fitness", icon: "⚽" },
      { id: "music", name: "Musical Instruments", icon: "🎸" },
      { id: "pets", name: "Pet Supplies", icon: "🐾" },
    ],
  },
];

const AUCTION_DURATIONS = [
  { id: "1", label: "1 Day" },
  { id: "2", label: "2 Days" },
  { id: "3", label: "3 Days" },
  { id: "4", label: "4 Days" },
  { id: "5", label: "5 Days" },
];

const SellerPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [productTitle, setProductTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(""); // Reset subcategory when category changes
  };

  const getSubcategories = () => {
    const category = CATEGORIES.find((cat) => cat.id === selectedCategory);
    return category?.subcategories || [];
  };

  const handleCreateAuction = () => {
    // Handle auction creation logic here
    console.log("Creating auction...");
    // Navigate back or show success message
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={image.back} style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
        <AppText weight="semibold" style={styles.headerTitle}>
          Create Auction
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Photos */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader]}>
            <Image source={image.camera} style={{ width: 16.25, height: 13 }} />
            <AppText weight="medium" style={styles.sectionTitle}>
              Product Photos * (Max 6)
            </AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              {/* First photo with "Cover" badge */}
              <View style={styles.photoWrapper}>
                <View style={styles.photoBox}>
                  <Image source={image.labubu} style={styles.photoImage} />
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverText}>Cover</Text>
                  </View>
                  <TouchableOpacity style={styles.removePhoto}>
                    <Image
                      source={image.remove}
                      style={{ width: 12, height: 12 }}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.photoHint}>
                  First Photo will be the cover image
                </Text>
              </View>

              {/* Add Photo button */}
              <TouchableOpacity style={styles.addPhotoBox}>
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Product Title */}
        <View style={styles.section}>
          <AppText weight="medium" style={styles.label}>
            Product Title *
          </AppText>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nike Air Jordan 1"
            value={productTitle}
            placeholderTextColor={"#D1D5DB"}
            onChangeText={setProductTitle}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <AppText weight="medium" style={styles.label}>
            Category *
          </AppText>
          <View style={styles.gridContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryBox,
                  selectedCategory === category.id &&
                    styles.categoryBoxSelected,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <AppText
                  weight={
                    selectedCategory === category.id ? "semibold" : "regular"
                  }
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subcategory - Only show when category is selected */}
        {selectedCategory && (
          <View style={styles.section}>
            <AppText weight="medium" style={styles.label}>
              Subcategory *
            </AppText>
            <View style={styles.gridContainer}>
              {getSubcategories().map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[
                    styles.categoryBox,
                    selectedSubcategory === subcategory.id &&
                      styles.categoryBoxSelected,
                  ]}
                  onPress={() => setSelectedSubcategory(subcategory.id)}
                >
                  <Text style={styles.categoryIcon}>{subcategory.icon}</Text>
                  <AppText
                    weight={
                      selectedSubcategory === subcategory.id
                        ? "semibold"
                        : "regular"
                    }
                    style={[
                      styles.categoryText,
                      selectedSubcategory === subcategory.id &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {subcategory.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.description}
              style={{ width: 13, height: 15 }}
            />
            <AppText weight="medium" style={styles.sectionTitle}>
              Description *
            </AppText>
          </View>
          <TextInput
            placeholderTextColor={"#D1D5DB"}
            style={styles.textArea}
            placeholder="Describe your product in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Pricing */}
        <View style={[styles.section]}>
          <View
            style={{
              paddingTop: 16,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderRadius: 8,
              borderColor: "#99FF94",
              backgroundColor: "#F1FFF3",
            }}
          >
            <View style={[styles.sectionHeader, { marginBottom: 16 }]}>
              <Image source={image.pricing} style={{ width: 16, height: 16 }} />
              <AppText weight="medium" style={styles.sectionTitle}>
                Pricing
              </AppText>
            </View>

            <View style={styles.priceInputContainer}>
              <AppText weight="regular" style={styles.priceLabel}>
                Starting Bid
              </AppText>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  value={startingBid}
                  onChangeText={setStartingBid}
                  keyboardType="numeric"
                  placeholderTextColor={"#D1D5DB"}
                />
              </View>
            </View>

            <View style={styles.priceInputContainer}>
              <AppText weight="regular" style={styles.priceLabel}>
                Buyout Price
              </AppText>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={"#D1D5DB"}
                  value={buyoutPrice}
                  onChangeText={setBuyoutPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.infoRow}>
                <Image source={image.info} style={{ width: 16, height: 16 }} />
                <Text style={styles.infoText}>
                  Buyers can purchase immediately at this price
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Auction Start */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.auction_time}
              style={{ width: 15.59, height: 17 }}
            />
            <AppText weight="medium" style={styles.sectionTitle}>
              Auction Start *
            </AppText>
          </View>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateTimeButton}>
              <AppTextInput
                style={styles.dateTimeInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={"#D1D5DB"}
                editable={false}
              />
              <TouchableOpacity style={styles.selectButton}>
                <Image
                  source={image.select_date}
                  style={{ width: 32, height: 32 }}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateTimeButton}>
              <TextInput
                style={styles.dateTimeInput}
                placeholder="XX:XX AM/PM"
                editable={false}
              />
              <TouchableOpacity style={styles.selectButton}>
                <Image
                  source={image.select_time}
                  style={{ width: 32, height: 32 }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auction Duration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.auction_time}
              style={{ width: 15.59, height: 17 }}
            />
            <AppText weight="medium" style={styles.sectionTitle}>
              Auction Duration *
            </AppText>
          </View>
          <View style={styles.durationContainer}>
            {AUCTION_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration.id}
                style={[
                  styles.durationBox,
                  auctionDuration === duration.id && styles.durationBoxSelected,
                ]}
                onPress={() => setAuctionDuration(duration.id)}
              >
                <AppText
                  weight={
                    auctionDuration === duration.id ? "semibold" : "regular"
                  }
                  style={[
                    styles.durationText,
                    auctionDuration === duration.id &&
                      styles.durationTextSelected,
                  ]}
                >
                  {duration.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <LinearGradient
          colors={["#00112E", "#003994"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButton}
        >
          <TouchableOpacity
            onPress={handleCreateAuction}
            style={styles.createButtonInner}
          >
            <AppText weight="semibold" style={styles.createButtonText}>
              Create Auction
            </AppText>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 12,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
  },
  photosContainer: {
    flexDirection: "row",
    gap: 12,
  },
  photoWrapper: {
    alignItems: "flex-start",
  },
  photoBox: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    paddingVertical: 4,
    alignItems: "center",
  },
  coverText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  removePhoto: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  photoHint: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    width: 100,
  },
  addPhotoBox: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoIcon: {
    fontSize: 32,
    color: "#9CA3AF",
  },
  addPhotoText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBox: {
    width: "32%",
    height: 80,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  categoryBoxSelected: {
    borderColor: "#2563EB",
    borderWidth: 1.5,
    backgroundColor: "#EFF6FF",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#2563EB",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    color: "#111827",
  },
  pricingSection: {
    backgroundColor: "#F0FDF4",
  },
  priceInputContainer: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#6B7280",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 10,
    color: "#6B7280",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    position: "relative",
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
  },
  selectButton: {
    position: "absolute",
    right: 6,
    top: 6,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationBox: {
    width: "32%",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  durationBoxSelected: {
    borderColor: "#2563EB",
    borderWidth: 1.5,
    backgroundColor: "#EFF6FF",
  },
  durationText: {
    fontSize: 14,
    color: "#374151",
  },
  durationTextSelected: {
    color: "#2563EB",
  },
  createButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 10,
    overflow: "hidden",
  },
  createButtonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SellerPage;
