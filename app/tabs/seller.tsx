import { image } from "@/assets/images";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";
import { Category, Subcategory } from "../../utils/api/types";
import { AppText } from "../components/appText";

// ─── 77 จังหวัดในประเทศไทย ───
const THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พะเยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
];

const SellerPage = () => {
  const router = useRouter();

  // ─── API Categories & Subcategories ───
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ─── Form State ───
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [productTitle, setProductTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [bidIncrement, setBidIncrement] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── Province Modal ───
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");

  // ─── Date/Time Picker ───
  const [auctionStartDate, setAuctionStartDate] = useState<Date | null>(null);
  const [auctionStartTime, setAuctionStartTime] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [auctionDate, setAuctionDate] = useState<Date | null>(null);
  const [auctionTime, setAuctionTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Temp value for iOS spinner (only commit on Done)
  const [tempPickerDate, setTempPickerDate] = useState<Date>(new Date());

  // ─── Category icons ───
  const CATEGORY_ICONS: Record<string, string> = {
    Electronics: "📱",
    Fashion: "👕",
    Collectibles: "🎨",
    Home: "🏠",
    Vehicles: "🚗",
    Others: "📦",
  };

  const SUBCATEGORY_ICONS: Record<string, string> = {
    "Smartphones & Tablets": "📱",
    "Computers & Laptops": "💻",
    "Cameras & Photography": "📷",
    "Audio & Headphones": "🎧",
    "Gaming & Consoles": "🎮",
    "Wearables & Smartwatch": "⌚",
    "Men's Clothing": "👔",
    "Women's Clothing": "👗",
    "Shoes & Footwear": "👟",
    "Bags & Accessories": "👜",
    "Watches & Jewelry": "⌚",
    "Art & Paintings": "🖼️",
    "Toys & Figures": "🧸",
    "Coins & Stamps": "🪙",
    "Trading Cards": "🃏",
    "Antiques & Vintage": "🏺",
    Furniture: "🛋️",
    "Home Decor": "🖼️",
    "Kitchen & Dining": "🍽️",
    "Garden & Outdoor": "🌱",
    Cars: "🚗",
    Motorcycles: "🏍️",
    "Parts & Accessories": "🔧",
    "Electric Vehicles": "⚡",
    "Books & Magazines": "📚",
    "Sports & Fitness": "⚽",
    "Musical Instruments": "🎸",
    "Pet Supplies": "🐾",
  };

  // ─── Fetch categories & subcategories from API ───
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const [cats, subs] = await Promise.all([
          apiService.category.getCategories(),
          apiService.category.getAllSubcategories(),
        ]);
        setCategories(cats);
        setAllSubcategories(subs);
      } catch (error: any) {
        console.error("Failed to fetch categories:", error.message);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  // ─── Filter subcategories when category changes ───
  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = allSubcategories.filter(
        (sub) => sub.category_id === selectedCategoryId,
      );
      setSubcategories(filtered);
    } else {
      setSubcategories([]);
    }
    setSelectedSubcategoryId(null);
  }, [selectedCategoryId, allSubcategories]);

  // ─── Image Picker ───
  const handleAddPhoto = async () => {
    if (photos.length >= 8) {
      Alert.alert("Maximum Photos", "You can upload up to 8 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Province Filter ───
  const filteredProvinces = THAI_PROVINCES.filter((p) =>
    p.includes(provinceSearch),
  );

  // ─── Date/Time Handlers ───
  const handleStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
      if (event.type === "set" && selectedDate)
        setAuctionStartDate(selectedDate);
    } else {
      // iOS: just update temp, don't close
      if (selectedDate) setTempPickerDate(selectedDate);
    }
  };

  const handleStartTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowStartTimePicker(false);
      if (event.type === "set" && selectedTime)
        setAuctionStartTime(selectedTime);
    } else {
      if (selectedTime) setTempPickerDate(selectedTime);
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && selectedDate) setAuctionDate(selectedDate);
    } else {
      if (selectedDate) setTempPickerDate(selectedDate);
    }
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
      if (event.type === "set" && selectedTime) setAuctionTime(selectedTime);
    } else {
      if (selectedTime) setTempPickerDate(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // ─── Build auction time strings ───
  const buildDateTimeString = (
    date: Date | null,
    time: Date | null,
  ): string | null => {
    if (!date || !time) return null;
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    const y = combined.getFullYear();
    const mo = (combined.getMonth() + 1).toString().padStart(2, "0");
    const d = combined.getDate().toString().padStart(2, "0");
    const h = combined.getHours().toString().padStart(2, "0");
    const mi = combined.getMinutes().toString().padStart(2, "0");
    return `${y}-${mo}-${d} ${h}:${mi}:00`;
  };

  // ─── Validation & Submit ───
  const handleCreateAuction = async () => {
    if (!productTitle.trim()) {
      Alert.alert("Required", "Please enter a product title.");
      return;
    }
    if (!selectedCategoryId || !selectedSubcategoryId) {
      Alert.alert("Required", "Please select a category and subcategory.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Required", "Please enter a description.");
      return;
    }
    if (!startingBid.trim()) {
      Alert.alert("Required", "Please enter a starting bid price.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Required", "Please select a location.");
      return;
    }
    if (!auctionStartDate || !auctionStartTime) {
      Alert.alert("Required", "Please select auction start date and time.");
      return;
    }
    if (!auctionDate || !auctionTime) {
      Alert.alert("Required", "Please select auction end date and time.");
      return;
    }

    const startTime = buildDateTimeString(auctionStartDate, auctionStartTime);
    const endTime = buildDateTimeString(auctionDate, auctionTime);
    if (!startTime || !endTime) {
      Alert.alert("Error", "Invalid auction time.");
      return;
    }

    try {
      setSubmitting(true);
      await apiService.product.createProduct({
        name: productTitle.trim(),
        description: description.trim(),
        starting_price: startingBid.trim(),
        bid_increment: bidIncrement.trim() || "1",
        buyout_price: buyoutPrice.trim() || "0",
        auction_start_time: startTime,
        auction_end_time: endTime,
        category_id: selectedCategoryId,
        subcategory_id: selectedSubcategoryId,
        location: location,
        picture: photos.length > 0 ? photos[0] : undefined,
        images: photos.length > 1 ? photos.slice(1) : undefined,
      });

      Alert.alert("Success", "Auction created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setProductTitle("");
            setDescription("");
            setStartingBid("");
            setBidIncrement("");
            setBuyoutPrice("");
            setLocation("");
            setPhotos([]);
            setSelectedCategoryId(null);
            setSelectedSubcategoryId(null);
            setAuctionStartDate(null);
            setAuctionStartTime(null);
            setAuctionDate(null);
            setAuctionTime(null);
            router.push("/tabs/home");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create auction. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={image.back} style={{ width: 32, height: 32 }} />
        </TouchableOpacity>
        <AppText weight="semibold" numberOfLines={1} style={styles.headerTitle}>
          Create Auction
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ════════ Product Photos ════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={image.camera} style={{ width: 16.25, height: 13 }} />
            <AppText
              weight="medium"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Product Photos * (Max 8)
            </AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <View style={styles.photoBox}>
                    <Image source={{ uri }} style={styles.photoImage} />
                    {index === 0 && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverText}>Cover</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removePhoto}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Image
                        source={image.remove}
                        style={{ width: 12, height: 12 }}
                      />
                    </TouchableOpacity>
                  </View>
                  {index === 0 && (
                    <Text style={styles.photoHint}>
                      First Photo will be the cover image
                    </Text>
                  )}
                </View>
              ))}

              {photos.length < 8 && (
                <TouchableOpacity
                  style={styles.addPhotoBox}
                  onPress={handleAddPhoto}
                >
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        {/* ════════ Product Title ════════ */}
        <View style={styles.section}>
          <AppText weight="medium" numberOfLines={1} style={styles.label}>
            Product Title *
          </AppText>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nike Air Jordan 1"
            value={productTitle}
            placeholderTextColor="#D1D5DB"
            onChangeText={setProductTitle}
          />
        </View>

        {/* ════════ Category ════════ */}
        <View style={styles.section}>
          <AppText weight="medium" numberOfLines={1} style={styles.label}>
            Category *
          </AppText>
          {loadingCategories ? (
            <ActivityIndicator
              size="small"
              color="#0088FF"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <View style={styles.gridContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBox,
                    selectedCategoryId === cat.id && styles.categoryBoxSelected,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={styles.categoryIcon}>
                    {CATEGORY_ICONS[cat.name] || "📦"}
                  </Text>
                  <AppText
                    weight={
                      selectedCategoryId === cat.id ? "semibold" : "regular"
                    }
                    numberOfLines={1}
                    style={[
                      styles.categoryText,
                      selectedCategoryId === cat.id &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ════════ Subcategory ════════ */}
        {selectedCategoryId && subcategories.length > 0 && (
          <View style={styles.section}>
            <AppText weight="medium" numberOfLines={1} style={styles.label}>
              Subcategory *
            </AppText>
            <View style={styles.gridContainer}>
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.categoryBox,
                    selectedSubcategoryId === sub.id &&
                      styles.categoryBoxSelected,
                  ]}
                  onPress={() => setSelectedSubcategoryId(sub.id)}
                >
                  <Text style={styles.categoryIcon}>
                    {SUBCATEGORY_ICONS[sub.name] || "📦"}
                  </Text>
                  <AppText
                    weight={
                      selectedSubcategoryId === sub.id ? "semibold" : "regular"
                    }
                    numberOfLines={1}
                    style={[
                      styles.categoryText,
                      selectedSubcategoryId === sub.id &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {sub.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ════════ Description ════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.description}
              style={{ width: 13, height: 15 }}
            />
            <AppText
              weight="medium"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Description *
            </AppText>
          </View>
          <TextInput
            placeholderTextColor="#D1D5DB"
            style={styles.textArea}
            placeholder="Describe your product in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ════════ Location (Thai Province) ════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={image.location_seller} style={{ width: 14, height: 17 }} />
            <AppText
              weight="medium"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Location *
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              setProvinceSearch("");
              setProvinceModalVisible(true);
            }}
          >
            <AppText
              weight="regular"
              style={{
                fontSize: 14,
                color: location ? "#111827" : "#D1D5DB",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {location || "เลือกจังหวัด..."}
            </AppText>
            <AppText style={{ fontSize: 16, color: "#9CA3AF" }}>▼</AppText>
          </TouchableOpacity>
        </View>

        {/* ════════ Pricing ════════ */}
        <View style={styles.section}>
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
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                Pricing
              </AppText>
            </View>

            <View style={styles.priceInputContainer}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.priceLabel}
              >
                Starting Bid *
              </AppText>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  value={startingBid}
                  onChangeText={setStartingBid}
                  keyboardType="numeric"
                  placeholderTextColor="#D1D5DB"
                />
              </View>
            </View>

            <View style={styles.priceInputContainer}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.priceLabel}
              >
                Bid Increment *
              </AppText>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  value={bidIncrement}
                  onChangeText={setBidIncrement}
                  keyboardType="numeric"
                  placeholderTextColor="#D1D5DB"
                />
              </View>
              <View style={styles.infoRow}>
                <Image source={image.info} style={{ width: 16, height: 16 }} />
                <Text style={styles.infoText}>
                  จำนวนเงินขั้นต่ำสุดต่อครั้ง (ถ้าไม่ใส่จะใช้ค่าเริ่มต้น 1)
                </Text>
              </View>
            </View>

            <View style={styles.priceInputContainer}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.priceLabel}
              >
                Buyout Price
              </AppText>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>฿</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
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

        {/* ════════ Auction Start Date & Time ════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.auction_time}
              style={{ width: 15.59, height: 17 }}
            />
            <AppText
              weight="medium"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Auction Start Date & Time *
            </AppText>
          </View>
          <View style={styles.dateTimeContainer}>
            {/* Start Date Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setTempPickerDate(auctionStartDate || new Date());
                setShowStartDatePicker(true);
              }}
            >
              <View style={styles.dateTimeInputWrapper}>
                <AppText
                  weight="regular"
                  style={{
                    fontSize: 14,
                    color: auctionStartDate ? "#111827" : "#D1D5DB",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {auctionStartDate
                    ? formatDate(auctionStartDate)
                    : "DD/MM/YYYY"}
                </AppText>
                <Image
                  source={image.select_date}
                  style={{ width: 28, height: 28 }}
                />
              </View>
            </TouchableOpacity>

            {/* Start Time Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setTempPickerDate(auctionStartTime || new Date());
                setShowStartTimePicker(true);
              }}
            >
              <View style={styles.dateTimeInputWrapper}>
                <AppText
                  weight="regular"
                  style={{
                    fontSize: 14,
                    color: auctionStartTime ? "#111827" : "#D1D5DB",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {auctionStartTime
                    ? formatTime(auctionStartTime)
                    : "XX:XX AM/PM"}
                </AppText>
                <Image
                  source={image.select_time}
                  style={{ width: 28, height: 28 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Start Summary */}
          {auctionStartDate && auctionStartTime && (
            <View style={styles.dateTimeSummary}>
              <AppText style={{ fontSize: 13, color: "#6B7280" }}>
                Auction starts:{" "}
              </AppText>
              <AppText
                weight="semibold"
                style={{ fontSize: 13, color: "#16A34A" }}
              >
                {formatDate(auctionStartDate)} at {formatTime(auctionStartTime)}
              </AppText>
            </View>
          )}
        </View>

        {/* ════════ Auction End Date & Time ════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={image.auction_time}
              style={{ width: 15.59, height: 17 }}
            />
            <AppText
              weight="medium"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Auction End Date & Time *
            </AppText>
          </View>
          <View style={styles.dateTimeContainer}>
            {/* Date Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setTempPickerDate(auctionDate || new Date());
                setShowDatePicker(true);
              }}
            >
              <View style={styles.dateTimeInputWrapper}>
                <AppText
                  weight="regular"
                  style={{
                    fontSize: 14,
                    color: auctionDate ? "#111827" : "#D1D5DB",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {auctionDate ? formatDate(auctionDate) : "DD/MM/YYYY"}
                </AppText>
                <Image
                  source={image.select_date}
                  style={{ width: 28, height: 28 }}
                />
              </View>
            </TouchableOpacity>

            {/* Time Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setTempPickerDate(auctionTime || new Date());
                setShowTimePicker(true);
              }}
            >
              <View style={styles.dateTimeInputWrapper}>
                <AppText
                  weight="regular"
                  style={{
                    fontSize: 14,
                    color: auctionTime ? "#111827" : "#D1D5DB",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {auctionTime ? formatTime(auctionTime) : "XX:XX AM/PM"}
                </AppText>
                <Image
                  source={image.select_time}
                  style={{ width: 28, height: 28 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          {auctionDate && auctionTime && (
            <View style={styles.dateTimeSummary}>
              <AppText style={{ fontSize: 13, color: "#6B7280" }}>
                Auction ends:{" "}
              </AppText>
              <AppText
                weight="semibold"
                style={{ fontSize: 13, color: "#2563EB" }}
              >
                {formatDate(auctionDate)} at {formatTime(auctionTime)}
              </AppText>
            </View>
          )}
        </View>

        {/* ════════ Create Button ════════ */}
        <LinearGradient
          colors={["#00112E", "#003994"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.createButton, submitting && { opacity: 0.7 }]}
        >
          <TouchableOpacity
            onPress={handleCreateAuction}
            style={styles.createButtonInner}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <AppText
                weight="semibold"
                numberOfLines={1}
                style={styles.createButtonText}
              >
                Create Auction
              </AppText>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ════════ Province Modal ════════ */}
      <Modal
        visible={provinceModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <AppText weight="semibold" style={styles.modalTitle}>
                เลือกจังหวัด
              </AppText>
              <TouchableOpacity
                onPress={() => setProvinceModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <AppText
                  weight="medium"
                  style={{ fontSize: 16, color: "#4285F4" }}
                >
                  ปิด
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.modalSearchWrapper}>
              <AppText
                style={{ fontSize: 14, color: "#9CA3AF", marginRight: 8 }}
              >
                🔍
              </AppText>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="ค้นหาจังหวัด..."
                placeholderTextColor="#B0B0B0"
                value={provinceSearch}
                onChangeText={setProvinceSearch}
                autoCorrect={false}
              />
              {provinceSearch.length > 0 && (
                <TouchableOpacity onPress={() => setProvinceSearch("")}>
                  <AppText style={{ fontSize: 13, color: "#999" }}>✕</AppText>
                </TouchableOpacity>
              )}
            </View>

            {/* Province List */}
            <FlatList
              data={filteredProvinces}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.provinceItem,
                    location === item && styles.provinceItemSelected,
                  ]}
                  onPress={() => {
                    setLocation(item);
                    setProvinceModalVisible(false);
                  }}
                >
                  <AppText
                    weight={location === item ? "semibold" : "regular"}
                    style={[
                      styles.provinceText,
                      location === item && styles.provinceTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </AppText>
                  {location === item && (
                    <AppText style={{ fontSize: 16, color: "#2563EB" }}>
                      ✓
                    </AppText>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <AppText
                    weight="regular"
                    style={{ fontSize: 14, color: "#9CA3AF" }}
                  >
                    ไม่พบจังหวัดที่ค้นหา
                  </AppText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ════════ Start Date Picker (iOS modal) ════════ */}
      {showStartDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" statusBarTranslucent>
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#FF3B30" }}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <AppText weight="semibold" style={{ fontSize: 16 }}>
                  Start Date
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setAuctionStartDate(tempPickerDate);
                    setShowStartDatePicker(false);
                  }}
                >
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#4285F4" }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={tempPickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handleStartDateChange}
                  style={{ height: 200, width: "100%" }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Start Date Picker */}
      {showStartDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={auctionStartDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleStartDateChange}
        />
      )}

      {/* ════════ Start Time Picker (iOS modal) ════════ */}
      {showStartTimePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" statusBarTranslucent>
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#FF3B30" }}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <AppText weight="semibold" style={{ fontSize: 16 }}>
                  Start Time
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setAuctionStartTime(tempPickerDate);
                    setShowStartTimePicker(false);
                  }}
                >
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#4285F4" }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={tempPickerDate}
                  mode="time"
                  display="spinner"
                  onChange={handleStartTimeChange}
                  style={{ height: 200, width: "100%" }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Start Time Picker */}
      {showStartTimePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={auctionStartTime || new Date()}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {/* ════════ Date Picker (iOS modal) ════════ */}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" statusBarTranslucent>
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#FF3B30" }}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <AppText weight="semibold" style={{ fontSize: 16 }}>
                  Select Date
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setAuctionDate(tempPickerDate);
                    setShowDatePicker(false);
                  }}
                >
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#4285F4" }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={tempPickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  style={{ height: 200, width: "100%" }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={auctionDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* ════════ Time Picker (iOS modal) ════════ */}
      {showTimePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" statusBarTranslucent>
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#FF3B30" }}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <AppText weight="semibold" style={{ fontSize: 16 }}>
                  Select Time
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setAuctionTime(tempPickerDate);
                    setShowTimePicker(false);
                  }}
                >
                  <AppText
                    weight="medium"
                    style={{ fontSize: 16, color: "#4285F4" }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={tempPickerDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={{ height: 200, width: "100%" }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Time Picker */}
      {showTimePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={auctionTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
  // Photos
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
  photoHint: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    width: 140,
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
  // Categories
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
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  categoryTextSelected: {
    color: "#2563EB",
  },
  // Description
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    color: "#111827",
  },
  // Location
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
  },
  // Pricing
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
  infoText: {
    fontSize: 10,
    color: "#6B7280",
    flex: 1,
  },
  // Date/Time
  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
  },
  dateTimeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateTimeSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
  },
  // Create Button
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
    fontSize: 15,
  },
  // Province Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    color: "#111827",
  },
  modalCloseBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  provinceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  provinceItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  provinceText: {
    fontSize: 15,
    color: "#374151",
  },
  provinceTextSelected: {
    color: "#2563EB",
  },
  // DateTimePicker modal (iOS)
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
});

export default SellerPage;
