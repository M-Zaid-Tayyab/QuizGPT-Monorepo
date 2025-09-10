import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type UploadedFile = {
  uri: string;
  name: string;
  type: string;
};

type FileUploadProps = {
  onFileSelect: (file: UploadedFile) => void;
  onFileRemove: () => void;
  selectedFile: UploadedFile | null;
  className?: string;
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  className,
}) => {
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log(res);
      if (res.canceled === false) {
        onFileSelect({
          uri: res.assets[0].uri,
          name: res.assets[0].name,
          type: res.assets[0].mimeType || "application/octet-stream",
        });
      }
    } catch (err) {
      // cancelled or error
    }
  };

  const pickImage = async () => {
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
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    }
  };

  return (
    <View className={clsx("w-full", className)}>
      {selectedFile ? (
        <View className="flex-row items-center bg-primary/10 rounded-lg px-2 py-4 mb-2">
          {selectedFile.type.includes("image") ? (
            <Image
              source={{ uri: selectedFile.uri }}
              className="w-12 h-12 rounded mr-3"
            />
          ) : (
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={40}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
          )}
          <View className="flex-1">
            <Text
              className="font-nunito-bold text-textPrimary"
              numberOfLines={1}
            >
              {selectedFile.name}
            </Text>
          </View>
          <TouchableOpacity onPress={onFileRemove} className="p-2">
            <Ionicons name="close-circle" size={24} color={colors.red} />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-4">
          <TouchableOpacity
            onPress={pickDocument}
            className="border-2 border-dashed border-gray-300 rounded-xl pt-6 px-3 bg-gray-50"
          >
            <View className="items-center">
              <View className="bg-primary/10 rounded-full p-4 mb-4">
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <Text className="text-lg font-nunito-bold text-textPrimary mb-2">
                Click to upload
              </Text>
              <Text className="text-textSecondary font-nunito text-center mb-4">
                Select PDF or image files from your device
              </Text>
              <View className="w-full mt-6 mb-3">
                <Text className="text-sm font-nunito-bold text-textPrimary mb-2">
                  Supported formats:
                </Text>
                <View className="flex-row items-center">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="file-pdf-box"
                      size={16}
                      color={colors.red}
                    />
                    <Text className="text-xs text-textSecondary mx-1">PDF</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="image"
                      size={16}
                      color={colors.success}
                    />
                    <Text className="text-xs text-textSecondary mx-1">
                      Images
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="file-document"
                      size={16}
                      color={colors.blue}
                    />
                    <Text className="text-xs text-textSecondary mx-1">
                      Max 10MB
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 bg-primary rounded-lg py-4 items-center flex-row justify-center mr-2"
            >
              <Ionicons name="camera" size={20} color={colors.white} />
              <Text className="text-white font-nunito-bold ml-2">Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              className="flex-1 bg-textPrimary rounded-lg py-4 items-center flex-row justify-center ml-2"
            >
              <Ionicons name="images" size={20} color={colors.white} />
              <Text className="text-white font-nunito-bold ml-2">Gallery</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-purple/10 rounded-lg p-3 mt-6">
            <View className="flex-row items-start">
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={16}
                color={colors.blue}
                style={{ marginTop: 2 }}
              />
              <Text className="text-xs text-purple font-nunito ml-2 flex-1">
                <Text className="font-nunito-bold">Tip:</Text> Upload study
                materials, textbooks, or lecture notes to generate personalized
                quizzes based on your content.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FileUpload;
