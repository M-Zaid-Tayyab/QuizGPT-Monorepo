import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface FilePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onFileSelect: (file: any) => void;
}

const FilePickerModal: React.FC<FilePickerModalProps> = ({
  isVisible,
  onClose,
  onFileSelect,
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
        onClose();
      }
    } catch (err) {
      console.log("Document picker error:", err);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        selectionLimit: 1,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onFileSelect({
          uri: asset.uri,
          name: asset.fileName || "photo.jpg",
          type: asset.mimeType || "image/jpeg",
        });
        onClose();
      }
    } catch (err) {
      console.log("Image picker error:", err);
    }
  };

  const pickFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        selectionLimit: 1,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onFileSelect({
          uri: asset.uri,
          name: asset.fileName || "image.jpg",
          type: asset.mimeType || "image/jpeg",
        });
        onClose();
      }
    } catch (err) {
      console.log("Gallery picker error:", err);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-borderColor">
            <Text className="text-xl font-nunito-bold text-textPrimary">
              Attach File
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-greyBackground rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="p-6">
            <Text className="text-textSecondary font-nunito text-sm mb-4">
              Choose how you'd like to attach a file:
            </Text>

            {/* Document Picker */}
            <TouchableOpacity
              onPress={pickDocument}
              className="flex-row items-center bg-primary/10 rounded-xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center mr-4">
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-nunito-bold text-base">
                  Choose from Files
                </Text>
                <Text className="text-textSecondary font-nunito text-sm">
                  PDF, Images, Documents
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Camera */}
            <TouchableOpacity
              onPress={pickImage}
              className="flex-row items-center bg-success/10 rounded-xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-success/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-nunito-bold text-base">
                  Take Photo
                </Text>
                <Text className="text-textSecondary font-nunito text-sm">
                  Capture with camera
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              onPress={pickFromGallery}
              className="flex-row items-center bg-blue/10 rounded-xl p-4"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-blue/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="images" size={24} color={colors.blue} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-nunito-bold text-base">
                  Choose from Gallery
                </Text>
                <Text className="text-textSecondary font-nunito text-sm">
                  Select from photos
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View className="bg-greyBackground/50 px-6 py-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text className="text-textSecondary font-nunito text-xs ml-2 flex-1">
                Supported formats: PDF, Images (JPG, PNG). Max size: 10MB
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilePickerModal;
