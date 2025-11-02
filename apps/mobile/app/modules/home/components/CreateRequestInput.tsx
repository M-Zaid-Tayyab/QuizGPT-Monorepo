import { BottomSheetInput } from "@/app/components/BottomSheetInput";
import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CreateRequestInputProps {
  topicText: string;
  onTextChange: (text: string) => void;
  attachedFile: any;
  onFileRemove: () => void;
  onFileSelect: (file: any) => void;
  className?: string;
}

const CreateRequestInput: React.FC<CreateRequestInputProps> = ({
  topicText,
  onTextChange,
  attachedFile,
  onFileRemove,
  onFileSelect,
  className,
}) => {
  const [inputMode, setInputMode] = useState<"file" | "text">("file");

  // If file is attached, force file mode. If file removed, go back to file mode
  useEffect(() => {
    if (attachedFile) {
      setInputMode("file");
    }
  }, [attachedFile]);
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
      }
    } catch (err) {
      console.log("Gallery picker error:", err);
    }
  };

  return (
    <View className={clsx("w-full", className)}>
      {inputMode === "file" ? (
        <>
          {attachedFile ? (
            <View className="bg-white rounded-2xl p-4 border border-borderColor">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="p-4 rounded-xl bg-primary/10 items-center justify-center mr-3">
                    {attachedFile.type?.includes("image") ? (
                      <MaterialCommunityIcons
                        name="file-image"
                        size={24}
                        color={colors.primary}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="file-pdf-box"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-textPrimary font-nunito-bold text-base mb-0.5"
                      numberOfLines={2}
                    >
                      {attachedFile.name || "Attached file"}
                    </Text>
                    <Text className="text-textSecondary font-nunito text-xs">
                      {attachedFile.type?.includes("image") ? "Image" : "PDF"}{" "}
                      file
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onFileRemove}
                  className="ml-5 p-2 bg-greyBackground rounded-full"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-base font-nunito-semibold text-textPrimary mb-3">
                Attach a file (Recommended)
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={pickFromGallery}
                  className="flex-1 bg-primary/10 rounded-2xl p-4 items-center border border-primary/20"
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center mb-2">
                    <Ionicons name="images" size={24} color={colors.primary} />
                  </View>
                  <Text className="text-textPrimary font-nunito-semibold text-sm text-center">
                    Gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImage}
                  className="flex-1 bg-success/10 rounded-2xl p-4 items-center border border-success/20"
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 bg-success/20 rounded-xl items-center justify-center mb-2">
                    <Ionicons name="camera" size={24} color={colors.success} />
                  </View>
                  <Text className="text-textPrimary font-nunito-semibold text-sm text-center">
                    Camera
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickDocument}
                  className="flex-1 bg-blue/10 rounded-2xl p-4 items-center border border-blue/20"
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 bg-blue/20 rounded-xl items-center justify-center mb-2">
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color={colors.blue}
                    />
                  </View>
                  <Text className="text-textPrimary font-nunito-semibold text-sm text-center">
                    Files
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!attachedFile && (
            <TouchableOpacity
              onPress={() => setInputMode("text")}
              className="items-center mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-nunito-semibold text-primary">
                Or type instead
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-nunito-semibold text-textPrimary">
              What do you want to study?
            </Text>
            <TouchableOpacity
              onPress={() => setInputMode("file")}
              className="px-3 py-1.5 rounded-lg bg-greyBackground"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-nunito-semibold text-textSecondary">
                Attach File
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm font-nunito text-textSecondary mb-3">
            Describe the topic, specific concepts you want to focus on, or areas
            you&apos;re struggling with
          </Text>
          <BottomSheetInput
            value={topicText}
            onChangeText={onTextChange}
            placeholder="e.g., Photosynthesis - focus on light reactions and areas I'm struggling with..."
            containerClassName=""
            inputClassName="text-base text-textPrimary font-nunito min-h-32"
            multiline
            numberOfLines={4}
          />
        </View>
      )}
    </View>
  );
};

export default CreateRequestInput;
