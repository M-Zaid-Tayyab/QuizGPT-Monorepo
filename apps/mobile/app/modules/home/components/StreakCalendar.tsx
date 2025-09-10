import React from "react";
import { Text, View } from "react-native";
const colors = require("@/app/constants/colors");

interface StreakCalendarProps {
  user: any;
  className?: string;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ user, className }) => {
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    if (user?.streak?.lastQuizDate && user?.streak?.current) {
      const endDate = new Date(user.streak.lastQuizDate);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (user.streak.current - 1));
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        marked[dateStr] = {
          customStyles: {
            container: {
              backgroundColor: colors.primary,
              borderRadius: 999,
            },
            text: {
              color: colors.white,
              fontWeight: "bold",
            },
          },
        };
      }
    }
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    if (!marked[todayStr]) {
      marked[todayStr] = {
        customStyles: {
          text: {
            color: colors.primary,
            fontWeight: "bold",
          },
        },
      };
    }
    return marked;
  };

  return (
    <View className={`bg-white rounded-lg p-4 drop-shadow-md ${className}`}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-orange-100 rounded-full p-3">
            <Text className="text-2xl">🔥</Text>
          </View>
          <View className="ml-4 items-center">
            {(user?.streak?.current || 0) === 0 &&
            (user?.streak?.longest || 0) === 0 ? (
              <>
                <Text className="text-lg font-nunito-bold text-textPrimary text-center">
                  Start Your Journey!
                </Text>
                <Text className="font-nunito text-textSecondary text-xs text-center">
                  Take your first quiz
                </Text>
              </>
            ) : (
              <>
                <Text className="text-3xl font-nunito-bold text-textPrimary">
                  {user?.streak?.current || 0}
                </Text>
                <Text className="font-nunito text-textSecondary text-sm">
                  Day Streak
                </Text>
              </>
            )}
          </View>
        </View>
        <View className="items-center">
          {(user?.streak?.current || 0) === 0 &&
          (user?.streak?.longest || 0) === 0 ? (
            <>
              <Text className="text-lg font-semibold text-textPrimary">
                Build
              </Text>
              <Text className="text-textSecondary text-sm">Your Streak</Text>
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold text-textPrimary">
                {user?.streak?.longest || 0}
              </Text>
              <Text className="text-textSecondary text-sm">Longest</Text>
            </>
          )}
        </View>
      </View>
      {/* <View style={{ alignItems: "center", marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: colors.textPrimary,
          }}
        >
          {new Date().toLocaleString("default", { month: "long" })}{" "}
          {new Date().getFullYear()}
        </Text>
      </View> */}
      {/* <Calendar
        markingType="custom"
        markedDates={getMarkedDates()}
        hideExtraDays
        firstDay={1}
        theme={{
          backgroundColor: colors.white,
          calendarBackground: colors.white,
          textSectionTitleColor: colors.textPrimary,
          dayTextColor: colors.textPrimary,
          todayTextColor: colors.primary,
          textDisabledColor: colors.textSecondary,
          monthTextColor: colors.textPrimary,
          arrowColor: colors.primary,
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
        }}
        disableMonthChange={true}
        hideArrows={true}
        renderHeader={() => null}
      /> */}
    </View>
  );
};

export default StreakCalendar;
