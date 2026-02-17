import { Button } from "@components/ui/Button";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    ViewToken
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  description: string;
  animation: any;
  color: string;
}



const OnboardingItem = ({ item, index, scrollX, currentIndex }: { item: Slide, index: number, scrollX: SharedValue<number>, currentIndex: number }) => {
    const colors = useTheme();
    const lottieRef = useRef<LottieView>(null);

    React.useEffect(() => {
        
        if (index === currentIndex) {
            lottieRef.current?.play(0);
        } else {
            lottieRef.current?.reset();
        }
    }, [currentIndex, index]);
    
    const rnStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width
        ];
        
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );
        
        const opacity = interpolate(
             scrollX.value,
             inputRange,
             [0.5, 1, 0.5],
             Extrapolation.CLAMP
        );
        
        return {
            transform: [{ scale }],
            opacity
        };
    });

    return (
        <View style={[styles.itemContainer, { width }]}>
            <Animated.View style={[styles.iconContainer, { backgroundColor: item.color + '20' }, rnStyle]}>
                 <LottieView
                    ref={lottieRef}
                    source={item.animation}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
            </Animated.View>
            <View style={{ flex: 0.3 }}>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
            </View>
        </View>
    );
};

const Paginator = ({ data, scrollX }: { data: Slide[], scrollX: SharedValue<number> }) => {
    const colors = useTheme();
    return (
        <View style={{ flexDirection: 'row', height: 64 }}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                
                const dotWidth = useAnimatedStyle(() => {
                    const w = interpolate(
                        scrollX.value,
                        inputRange,
                        [10, 20, 10],
                        Extrapolation.CLAMP
                    );
                    return { width: w };
                });

                const opacity = useAnimatedStyle(() => {
                     const op = interpolate(
                        scrollX.value,
                        inputRange,
                        [0.3, 1, 0.3],
                        Extrapolation.CLAMP
                    );
                    return { opacity: op };
                });

                return (
                    <Animated.View
                        key={i.toString()}
                        style={[
                            styles.dot,
                            { backgroundColor: colors.primary },
                            dotWidth,
                            opacity
                        ]}
                    />
                );
            })}
        </View>
    );
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const slidesRef = useRef<FlatList>(null);
  const { completeOnboarding, session } = useStore();
  const router = useRouter();
  const colors = useTheme();

  const slides: Slide[] = useMemo(() => [
    {
      id: "1",
      title: t("onboarding.slide1Title"),
      description: t("onboarding.slide1Desc"),
      animation: require("@assets/animations/cards.json"),
      color: "#4A90E2",
    },
    {
      id: "2",
      title: t("onboarding.slide2Title"),
      description: t("onboarding.slide2Desc"),
      animation: require("@assets/animations/brain.json"),
      color: "#50E3C2",
    },
    {
      id: "3",
      title: t("onboarding.slide3Title"),
      description: t("onboarding.slide3Desc"),
      animation: require("@assets/animations/trophy.json"),
      color: "#F5A623",
    },
  ], [t]);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0] && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleScroll = (event: any) => {
      scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
        slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
        finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
      await completeOnboarding();
      router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 3 }}>
            <FlatList
                data={slides}
                renderItem={({ item, index }) => <OnboardingItem item={item} index={index} scrollX={scrollX} currentIndex={currentIndex} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
                scrollEventThrottle={32}
            />
        </View>

        <Paginator data={slides} scrollX={scrollX} />

        <View style={styles.footer}>
            <Button
                title={currentIndex === slides.length - 1 ? t("onboarding.getStarted") : t("onboarding.next")}
                onPress={scrollToNext}
                size="lg"
                style={{ width: '100%' }}
            />
            {currentIndex < slides.length - 1 && (
                 <Button
                    title={t("common.skip") || "Skip"}
                    variant="ghost"
                    onPress={finishOnboarding}
                    style={{ marginTop: 10 }}
                />
            )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
      flex: 0.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      aspectRatio: 1,
      marginBottom: 40,
  },
  lottie: {
      width: '80%',
      height: '80%',
  },
  title: {
    fontWeight: "800",
    fontSize: 28,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontWeight: "400",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  footer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      width: '100%',
  }
});
