import Input from "@/app/components/Input";
import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UploadedFile } from "./FileUpload";

type PromptComposerProps = {
  prompt: string;
  onPromptChange: (text: string) => void;
  onClearPrompt: () => void;
  suggestions?: string[];
  selectedFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onFileRemove: () => void;
  className?: string;
};

const PromptComposer: React.FC<PromptComposerProps> = ({
  prompt,
  onPromptChange,
  onClearPrompt,
  suggestions = [],
  selectedFile,
  onFileSelect,
  onFileRemove,
  className,
}) => {
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled === false) {
        onFileSelect({
          uri: res.assets[0].uri,
          name: res.assets[0].name,
          type: res.assets[0].mimeType || "application/octet-stream",
        });
      }
    } catch {}
  };

  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      selectionLimit: 1,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      onFileSelect({
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      });
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 1,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      onFileSelect({
        uri: asset.uri,
        name: asset.fileName || "image.jpg",
        type: asset.mimeType || "image/jpeg",
      });
    }
  };

  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const plusRotation = useRef(new Animated.Value(0)).current;
  const openAttachMenu = () => {
    setIsAttachOpen(true);
    Animated.timing(plusRotation, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const closeAttachMenu = () => {
    setIsAttachOpen(false);
    Animated.timing(plusRotation, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const plusRotate = plusRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View
      className={clsx(
        "bg-white rounded-2xl shadow-sm p-4 border border-gray-100",
        className
      )}
    >
      <View className="flex-row items-center mb-3">
        <View className="bg-primary/10 rounded-lg p-2 mr-3">
          <Text className="text-2xl">🧠</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-textPrimary">
            Prompt
          </Text>
          <Text className="text-textSecondary font-nunito text-sm">
            Chat-style composer with quick attach
          </Text>
        </View>
      </View>

      {selectedFile && (
        <View className="flex-row items-center bg-primary/10 rounded-xl px-3 py-3 mb-3">
          {selectedFile.type.includes("image") ? (
            <Image
              source={{ uri: selectedFile.uri }}
              className="w-10 h-10 rounded mr-3"
            />
          ) : (
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={28}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
          )}
          <Text
            className="flex-1 font-nunito text-textPrimary"
            numberOfLines={1}
          >
            {selectedFile.name}
          </Text>
          <TouchableOpacity onPress={onFileRemove} className="pl-2">
            <Ionicons name="close-circle" size={22} color={colors.red} />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-end bg-white rounded-2xl px-2 py-2 border border-gray-200 shadow-sm">
        <TouchableOpacity
          onPress={openAttachMenu}
          className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-2"
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: plusRotate }] }}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Animated.View>
        </TouchableOpacity>
        <View className="flex-1">
          <Input
            value={prompt}
            onChangeText={onPromptChange}
            placeholder="Type your prompt..."
            multiline
            numberOfCharacter={10000}
            className="py-2"
            inputClassName="min-h-12 max-h-40"
            inputStyle={{ textAlignVertical: "top" }}
          />
        </View>
        {!!prompt?.length && (
          <TouchableOpacity
            onPress={onClearPrompt}
            className="ml-2 px-3 py-2 rounded-full bg-white border border-gray-200"
            activeOpacity={0.8}
          >
            <Text className="text-textSecondary text-xs font-nunito-semibold">
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!!suggestions?.length && (
        <View className="mt-3">
          <View className="flex-row flex-wrap">
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onPromptChange(s)}
                className="mr-2 mb-2 px-3 py-2 rounded-full bg-primary/10"
                activeOpacity={0.7}
              >
                <Text className="text-primary text-xs font-nunito-semibold">
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View className="bg-purple/10 rounded-lg p-3 mt-4">
        <View className="flex-row items-start">
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={colors.blue}
            style={{ marginTop: 2 }}
          />
          <Text className="text-xs text-purple font-nunito ml-2 flex-1">
            Tap + to attach a PDF or image. Short prompts work best.
          </Text>
        </View>
      </View>
      <Modal
        transparent
        visible={isAttachOpen}
        animationType="fade"
        onRequestClose={closeAttachMenu}
      >
        <Pressable onPress={closeAttachMenu} className="flex-1 bg-black/40" />
        <View className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 border-t border-gray-100">
          <View className="items-center mb-3">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>
          <Text className="text-lg font-nunito-bold text-textPrimary mb-2">
            Attach
          </Text>
          <Text className="text-textSecondary font-nunito mb-4">
            Choose a source
          </Text>
          <TouchableOpacity
            onPress={() => {
              closeAttachMenu();
              pickDocument();
            }}
            className="flex-row items-center p-3 rounded-2xl bg-gray-50 mb-2"
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <MaterialCommunityIcons
                name="file-upload-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="font-nunito-bold text-textPrimary">
                Upload PDF/Image
              </Text>
              <Text className="text-xs text-textSecondary font-nunito">
                Pick a document or image from device
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              closeAttachMenu();
              captureImage();
            }}
            className="flex-row items-center p-3 rounded-2xl bg-gray-50 mb-2"
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center mr-3">
              <Ionicons name="camera" size={20} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="font-nunito-bold text-textPrimary">
                Capture Photo
              </Text>
              <Text className="text-xs text-textSecondary font-nunito">
                Use your camera to snap content
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              closeAttachMenu();
              pickFromGallery();
            }}
            className="flex-row items-center p-3 rounded-2xl bg-gray-50"
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 rounded-xl bg-textPrimary items-center justify-center mr-3">
              <Ionicons name="images" size={20} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="font-nunito-bold text-textPrimary">
                Pick from Gallery
              </Text>
              <Text className="text-xs text-textSecondary font-nunito">
                Select an image from your library
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={closeAttachMenu}
            className="mt-4 py-3 rounded-2xl bg-gray-100 items-center"
            activeOpacity={0.8}
          >
            <Text className="font-nunito text-textSecondary">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default PromptComposer;
