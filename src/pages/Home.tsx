import { useState, useEffect } from "react";
import Close from "../assets/icons/Close.svg";
import Coin from "../assets/icons/Coin.svg";
import Crown from "../assets/icons/crown.svg";
import { detectPlatform, type Platform } from "../utils/platformDetection";
import { trackingIntro } from "../utils/FirebaseUtils";

// Constants from iOS app script
const PLATFORM = Object.freeze({
  IOS: "ios",
  ANDROID: "android",
});

// Android Product structure
interface AndroidProduct {
  productId: string;
  coin: number;
  index: number;
  priceTitle: string;
  subTitle: string;
  specialTitle: string;
  isSpecial: boolean;
  price: string;
  sale: string;
  currency: string;
}

// iOS Product structure
interface IOSProduct {
  productId: string;
  coin: number;
  bonus: number;
  index: number;
  costIapId: string;
  priceTitle: string;
  title: string;
  subTitle: string;
  specialTitle: string;
  isSpecial: boolean;
  currency: string;
}

// Unified Product interface for internal use
interface Product {
  productId: string;
  coin: number;
  index: number;
  priceTitle: string;
  subTitle: string;
  specialTitle: string;
  isSpecial: boolean;
  price?: string;
  sale?: string;
  bonus?: number;
  title?: string;
  costIapId?: string;
  currency?: string;
}

interface ExtraInfo {
  myCoin: number;
  priceFor: number;
  film_id: number;
  episode: number;
}

// Declare global window properties (matching iOS script)
declare global {
  interface Window {
    localPromises: {
      [key: string]: {
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
      };
    };
    webkit?: {
      messageHandlers?: {
        event?: {
          postMessage: (message: any) => void;
        };
        ReactNativeWebView?: {
          postMessage: (message: any) => void;
        };
      };
    };
    ikapp?: {
      languageCode?: string;
      products?: any[];
      extraInfo?: any;
      platform?: string;
      onProductsChanged?: (products: any[]) => void;
      onLanguageCodeChanged?: (languageCode: string) => void;
      onPlatformChanged?: (platform: string) => void;
      trackingEvent?: (name: string, params: any) => void;
      setShowLoading?: (loading: boolean) => void;
      restorePurchase?: () => Promise<any>;
      purchaseProduct?: (productId: string) => Promise<any>;
      haptics?: () => void;
      getLocalStorage?: (key: string) => Promise<any>;
      dismiss?: () => void;
      showPrivacyPolicy?: () => void;
      showTermOfUse?: () => void;
      sendToClient?: (event: string, payload: any) => Promise<any>;
    };
  }
}

export default function Home() {
  const [weeklyVip, setWeeklyVip] = useState<Product | null>(null);
  const [monthlyVip, setMonthlyVip] = useState<Product | null>(null);
  const [yearlyVip, setYearlyVip] = useState<Product | null>(null);
  const [coinPackages, setCoinPackages] = useState<Product[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<
    "weekly" | "monthly" | "yearly"
  >("weekly");
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<number>(0);
  const [extraInfo, setExtraInfo] = useState<ExtraInfo>({
    myCoin: 0,
    priceFor: 100,
    film_id: 0,
    episode: 0,
  });
  const [platform, setPlatform] = useState<Platform>("unknown");

  // Utility functions to transform platform-specific data
  const transformAndroidProduct = (androidProduct: AndroidProduct): Product => {
    return {
      productId: androidProduct.productId,
      coin: androidProduct.coin,
      index: androidProduct.index,
      priceTitle: androidProduct.priceTitle,
      subTitle: androidProduct.subTitle,
      specialTitle: androidProduct.specialTitle,
      isSpecial: androidProduct.isSpecial,
      price: androidProduct.price,
      sale: androidProduct.sale,
      currency: androidProduct.currency,
    };
  };

  const transformIOSProduct = (iosProduct: IOSProduct): Product => {
    return {
      productId: iosProduct.productId,
      coin: iosProduct.coin,
      index: iosProduct.index,
      priceTitle: iosProduct.priceTitle,
      subTitle: iosProduct.subTitle,
      specialTitle: iosProduct.specialTitle,
      isSpecial: iosProduct.isSpecial,
      bonus: iosProduct.bonus,
      title: iosProduct.title,
      costIapId: iosProduct.costIapId,
      // For iOS, we don't have price/sale fields directly
      // They might be embedded in priceTitle with %@ placeholder
      currency: iosProduct.currency,
    };
  };

  const processProductsBasedOnPlatform = (rawProducts: any[]): Product[] => {
    if (platform === PLATFORM.ANDROID) {
      return rawProducts.map((product: AndroidProduct) =>
        transformAndroidProduct(product)
      );
    } else if (platform === PLATFORM.IOS) {
      return rawProducts.map((product: IOSProduct) =>
        transformIOSProduct(product)
      );
    } else {
      // Unknown platform, try to handle both formats
      return rawProducts.map((product: any) => {
        if ("bonus" in product && "title" in product) {
          // Looks like iOS format
          return transformIOSProduct(product as IOSProduct);
        } else {
          // Assume Android format
          return transformAndroidProduct(product as AndroidProduct);
        }
      });
    }
  };

  // Helper functions for rendering based on platform
  const renderCoinPackageBonus = (packageItem: Product) => {
    if (
      platform === PLATFORM.IOS &&
      packageItem.bonus &&
      packageItem.bonus > 0
    ) {
      // iOS: show bonus coins
      return (
        <>
          <span className="text-[18px] leading-[28px] font-[600] text-white">
            +
          </span>
          <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
            {packageItem.bonus}
          </span>
        </>
      );
    } else if (platform === PLATFORM.ANDROID && packageItem.subTitle) {
      // Android: show subtitle bonus
      return (
        <>
          <span className="text-[18px] leading-[28px] font-[600] text-white">
            +
          </span>
          <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
            {packageItem.subTitle.replace("+ ", "").replace(" coins bonus", "")}
          </span>
        </>
      );
    }
    return null;
  };

  const renderSubscriptionPrice = (subscription: Product | null) => {
    if (platform === PLATFORM.IOS) {
      // For iOS, priceTitle contains %@ placeholder - replace with actual price or show as is
      // Since we don't have actual price data, we'll show the priceTitle pattern
      return subscription?.priceTitle?.replace("%@", "Price") || "";
    } else if (platform === PLATFORM.ANDROID) {
      // For Android, we have separate price and sale fields
      return subscription?.price || "";
    }
    return "";
  };

  const renderSubscriptionSale = (subscription: Product | null) => {
    if (platform === PLATFORM.ANDROID && subscription?.sale) {
      return subscription.sale;
    }
    // iOS doesn't have separate sale field
    return null;
  };

  const renderBonusSpecialTitle = (packageItem: Product) => {
    if (
      platform === PLATFORM.IOS &&
      packageItem.bonus &&
      packageItem.bonus > 0
    ) {
      // Calculate bonus percentage for iOS
      const bonusPercent = Math.round(
        (packageItem.bonus / packageItem.coin) * 100
      );
      return `BONUS ${bonusPercent}%`;
    } else if (platform === PLATFORM.ANDROID && packageItem.specialTitle) {
      return packageItem.specialTitle;
    }
    return null;
  };

  const shouldShowBonusBadge = (packageItem: Product) => {
    if (platform === PLATFORM.IOS) {
      return packageItem.bonus && packageItem.bonus > 0;
    } else if (platform === PLATFORM.ANDROID) {
      return packageItem.isSpecial && packageItem.specialTitle;
    }
    return false;
  };

  // Initialize platform detection and localPromises
  useEffect(() => {
    if (!window.localPromises) {
      window.localPromises = {};
    }

    // Detect platform - prioritize ikapp.platform if available
    let detectedPlatform: Platform = "unknown";
    if (window.ikapp?.platform) {
      detectedPlatform = window.ikapp.platform as Platform;
      console.log("Platform from ikapp:", detectedPlatform);
    } else {
      detectedPlatform = detectPlatform();
      console.log("Platform from detection:", detectedPlatform);
    }

    setPlatform(detectedPlatform);

    // Setup ikapp platform change listener
    if (window.ikapp?.onPlatformChanged) {
      window.ikapp.onPlatformChanged = (newPlatform: string) => {
        console.log("Platform changed to:", newPlatform);
        setPlatform(newPlatform as Platform);
      };
    }
  }, []);

  // Async function to send events to client
  async function sendToClient(event: string, payload: any) {
    return new Promise((resolve, reject) => {
      const eventId = crypto.randomUUID();
      const payloadEvent = {
        eventId: eventId,
        event: event,
        payload: {
          ...payload,
          platform: platform, // Include platform info in payload
        },
      };
      window.localPromises[eventId] = { resolve, reject };

      console.log(`Sending to ${platform}:`, payloadEvent);

      // Send based on detected platform
      if (platform === PLATFORM.IOS && window.webkit?.messageHandlers?.event) {
        window.webkit.messageHandlers.event.postMessage(payloadEvent);
      } else if (
        platform === PLATFORM.ANDROID &&
        (window as any).AndroidBridge?.postMessage
      ) {
        (window as any).AndroidBridge.postMessage(JSON.stringify(payloadEvent));
      } else {
        // Fallback: try both methods
        if (window.webkit?.messageHandlers?.event) {
          window.webkit.messageHandlers.event.postMessage(payloadEvent);
        } else if ((window as any).AndroidBridge?.postMessage) {
          (window as any).AndroidBridge.postMessage(
            JSON.stringify(payloadEvent)
          );
        } else {
          console.warn("No communication bridge found for platform:", platform);
          reject(new Error("No communication bridge available"));
        }
      }
    });
  }

  // Lắng nghe sự kiện từ mobile
  useEffect(() => {
    // Simple polling to check for data every 500ms
    const checkForData = () => {
      // Check for products
      if ((window as any).ikapp?.products) {
        const rawProducts = (window as any).ikapp.products;
        console.log("Raw products found:", rawProducts);
        console.log("Processing for platform:", platform);

        // Process products based on platform
        const processedProducts = processProductsBasedOnPlatform(rawProducts);
        console.log("Processed products:", processedProducts);

        // Tách subscription products (coin = 0)
        const subscriptionProducts = processedProducts.filter(
          (product: Product) => product.coin === 0
        );

        // Tách coin packages (coin > 0) và sắp xếp theo index
        const coinProducts = processedProducts
          .filter((product: Product) => product.coin > 0)
          .sort((a: Product, b: Product) => a.index - b.index);

        setCoinPackages(coinProducts);

        // Xử lý subscription products với platform-specific product IDs
        let weeklyVip: Product | undefined;
        let monthlyVip: Product | undefined;
        let yearlyVip: Product | undefined;

        if (platform === PLATFORM.ANDROID) {
          weeklyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "idrama_sub_weekly_vip_2"
          );
          monthlyVip = subscriptionProducts.find(
            (product: Product) => product.productId === "monthly_vip_1"
          );
          yearlyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "idrama_sub_yearly_vip_1"
          );
        } else if (platform === PLATFORM.IOS) {
          // For iOS, map based on exact productId and distinguish by priceTitle/subTitle
          weeklyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "iOS_Short_Drama_sub_weekly_vip_2" &&
              (product.priceTitle?.includes("Per week") ||
                product.subTitle?.includes("1 week"))
          );
          monthlyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "iOS_Short_Drama_sub_weekly_vip_2" &&
              (product.priceTitle?.includes("Per Month") ||
                product.subTitle?.includes("1 month"))
          );
          yearlyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "iOS_Short_Drama_sub_yearly_vip_1" &&
              (product.priceTitle?.includes("Per Year") ||
                product.subTitle?.includes("1 year"))
          );
        } else {
          // Fallback for unknown platform
          weeklyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId.includes("weekly") ||
              product.productId === "idrama_sub_weekly_vip_2"
          );
          monthlyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId === "monthly_vip_1" ||
              product.subTitle?.includes("month")
          );
          yearlyVip = subscriptionProducts.find(
            (product: Product) =>
              product.productId.includes("yearly") ||
              product.productId === "idrama_sub_yearly_vip_1"
          );
        }

        if (weeklyVip) {
          setWeeklyVip(weeklyVip);
        }
        if (monthlyVip) {
          setMonthlyVip(monthlyVip);
        }
        if (yearlyVip) {
          setYearlyVip(yearlyVip);
        }
      }

      // Check for extraInfo
      if ((window as any).ikapp?.extraInfo) {
        const extraInfoData = (window as any).ikapp.extraInfo;
        console.log("ExtraInfo found:", extraInfoData);
        setExtraInfo(extraInfoData);
      }
    };

    // Check immediately on mount
    checkForData();

    // Set up polling interval
    const interval = setInterval(() => {
      checkForData();
    }, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []); // Listen to window.ikapp changes

  // Separate useEffect to monitor when data is actually received
  useEffect(() => {
    if (weeklyVip || monthlyVip || yearlyVip) {
      console.log("Subscription products received:", {
        weeklyVip,
        monthlyVip,
        yearlyVip,
      });
    }
  }, [weeklyVip, monthlyVip, yearlyVip]);

  useEffect(() => {
    if (coinPackages.length > 0) {
      console.log("Coin packages received:", coinPackages);
    }
  }, [coinPackages]);

  useEffect(() => {
    if (extraInfo.myCoin > 0 || extraInfo.priceFor > 0) {
      console.log("Extra info received:", extraInfo);
    }
  }, [extraInfo]);

  // const sendMessageToMobile = () => {
  //   const message = {
  //     type: "BUTTON_CLICK",
  //     payload: {
  //       clickedAt: Date.now(),
  //       message: "User clicked the button!",
  //       count: count + 1,
  //     },
  //   };

  //   // 👉 Android (Kotlin) nhận qua AndroidBridge
  //   if ((window as any).AndroidBridge?.postMessage) {
  //     (window as any).AndroidBridge.postMessage(JSON.stringify(message));
  //   }

  //   // 👉 iOS (WKWebView) nhận qua messageHandlers
  //   if ((window as any).webkit?.messageHandlers?.ReactNativeWebView) {
  //     (window as any).webkit.messageHandlers.ReactNativeWebView.postMessage(
  //       JSON.stringify(message)
  //     );
  //   }

  //   setCount(count + 1);
  // };

  const handlePlanSelection = async (plan: "weekly" | "monthly" | "yearly") => {
    setSelectedPlan(plan);

    // Get the selected product based on plan
    let selectedProduct: Product | null = null;
    switch (plan) {
      case "weekly":
        selectedProduct = weeklyVip;
        break;
      case "monthly":
        selectedProduct = monthlyVip;
        break;
      case "yearly":
        selectedProduct = yearlyVip;
        break;
    }
    // Track plan selection
    handleTracking("select_product", {
      action_name: "select_product",
      premium_screen_name: "iap_unlock_episode_ver1",
      product_id: selectedPlan,
      product_type: plan,
      price: renderSubscriptionPrice(selectedProduct)?.replace("$", "") || "0",
      currency: selectedProduct?.currency || "USD",
      film_id: extraInfo.film_id,
      episode: extraInfo.episode,
    });
    if (selectedProduct) {
      if (platform === PLATFORM.IOS) {
        // iOS: Use ikapp.purchaseProduct following the iOS script flow
        try {
          if (window.ikapp?.purchaseProduct) {
            console.log(
              "iOS: Calling ikapp.purchaseProduct for:",
              selectedProduct.productId
            );
            const result = await window.ikapp.purchaseProduct(
              selectedProduct.productId
            );
            console.log("iOS purchase result:", result);
          } else {
            console.warn("iOS: ikapp.purchaseProduct not available");
          }
        } catch (error) {
          console.error("iOS purchase error:", error);
        }
      } else {
        // Android: Send selection event
        await sendToClient("PLAN_SELECTED", {
          productId: selectedProduct.productId,
        });
      }
    }
  };

  const handleTracking = (event: string, params: any) => {
    trackingIntro(event, "sdk_premium_track", params);
  };

  const handleCoinPackageSelection = async (index: number) => {
    setSelectedCoinPackage(index);

    // Get the selected coin package
    const selectedPackage = coinPackages[index];
    handleTracking("select_product", {
      action_name: "select_product",
      premium_screen_name: "iap_unlock_episode_ver1",
      product_id: selectedCoinPackage,
      product_type: "iap",
      price: selectedPackage.priceTitle?.replace("$", "") || "0",
      currency: selectedPackage.currency || "USD",
      film_id: extraInfo.film_id,
      episode: extraInfo.episode,
    });
    if (selectedPackage) {
      // Track coin package selection

      if (platform === PLATFORM.IOS) {
        // iOS: Use ikapp.purchaseProduct following the iOS script flow
        try {
          if (window.ikapp?.purchaseProduct) {
            console.log(
              "iOS: Calling ikapp.purchaseProduct for:",
              selectedPackage.productId
            );
            const result = await window.ikapp.purchaseProduct(
              selectedPackage.productId
            );
            console.log("iOS purchase result:", result);
          } else {
            console.warn("iOS: ikapp.purchaseProduct not available");
          }
        } catch (error) {
          console.error("iOS purchase error:", error);
        }
      } else {
        // Android: Send selection event
        await sendToClient("COIN_PACKAGE_SELECTED", {
          productId: selectedPackage.productId,
        });
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full mb-10"
      style={{
        touchAction: "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitOverflowScrolling: "touch",
        minHeight: 0,
      }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 sticky top-0 z-10">
        {/* DramaShort Premium */}
        <div className="flex flex-row items-center justify-between bg-gradient-to-b from-[#5C4E3E] to-[#141415] p-4">
          <div className="flex flex-col">
            <span className="text-[18px] font-[600] leading-[28px] text-white">
              DramaShort Premium
            </span>
          </div>
          <button
            onClick={() => {
              if (platform === PLATFORM.IOS && window.ikapp?.dismiss) {
                window.ikapp.dismiss();
              } else {
                sendToClient("CLOSE_PREMIUM", {});
              }
            }}
          >
            <img src={Close} alt="close" />
          </button>
        </div>

        {/* Price for this Ep: */}
        <div className="flex flex-row justify-start items-center gap-10 px-4 py-4 bg-[#141415]">
          <div className=" flex flex-row gap-2">
            <span className="text-[14px] leading-[20px] font-[400] text-[#9E9E9F]">
              Price for this Ep:
            </span>
            <div className="flex flex-row gap-1">
              <img src={Coin} alt="coin" />
              <span className="text-[14px] leading-[20px] font-[500] text-[#E2E2E2]">
                {extraInfo.priceFor || 100}
              </span>
            </div>
          </div>
          <div className=" flex flex-row gap-2">
            <span className="text-[14px] leading-[20px] font-[400] text-[#9E9E9F]">
              Balance:
            </span>
            <div className="flex flex-row gap-1">
              <img src={Coin} alt="coin" />
              <span className="text-[14px] leading-[20px] font-[500] text-[#E2E2E2]">
                {extraInfo.myCoin || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {/* Subscription */}
        <div className="flex flex-col gap-4 px-4 py-4">
          <div
            className={`grid grid-cols-12 gap-4 ${
              selectedPlan === "weekly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1`}
            onClick={() => handlePlanSelection("weekly")}
          >
            <div className="col-span-8 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    {platform === PLATFORM.IOS
                      ? weeklyVip?.title || "Weekly Member"
                      : "Weekly VIP"}
                  </span>
                </div>
                <span className="text-[11px] leading-[16px] font-[500] text-[#E2E2E2]">
                  {`${weeklyVip?.subTitle} ${renderSubscriptionPrice(
                    weeklyVip
                  )}  for the first week, then ${renderSubscriptionSale(
                    weeklyVip
                  )}/week` ||
                    "Unlimited access to all series for 1 week $19.99 for the first month, then $24.99/month"}
                </span>
                <span className="font-[500] text-[9px] leading-[12px] text-white">
                  Auto renew • Cancel anytime
                </span>
              </div>
            </div>
            <div className="col-span-4  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {renderSubscriptionPrice(weeklyVip) || "$19.99"}
                </span>
                {renderSubscriptionSale(weeklyVip) && (
                  <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                    {renderSubscriptionSale(weeklyVip)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={`grid grid-cols-12 gap-4 ${
              selectedPlan === "monthly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1`}
            onClick={() => handlePlanSelection("monthly")}
          >
            <div className="col-span-8 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    {platform === PLATFORM.IOS
                      ? monthlyVip?.title || "Monthly Member"
                      : "Monthly VIP"}
                  </span>
                </div>
                <span className="text-[11px] leading-[16px] font-[500] text-[#E2E2E2]">
                  {monthlyVip?.subTitle ||
                    "Unlimited access to all series for 1 month"}
                </span>
                <span className="font-[500] text-[9px] leading-[12px] text-white">
                  Auto renew • Cancel anytime
                </span>
              </div>
            </div>
            <div className="col-span-4  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {renderSubscriptionPrice(monthlyVip) || "36.99$"}
                </span>
                {/* {renderSubscriptionSale(monthlyVip) && (
                  <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                    {renderSubscriptionSale(monthlyVip)}
                  </span>
                )} */}
              </div>
            </div>
          </div>
          <div
            className={`grid grid-cols-12 gap-4 ${
              selectedPlan === "yearly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1`}
            onClick={() => handlePlanSelection("yearly")}
          >
            <div className="col-span-8 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    {platform === PLATFORM.IOS
                      ? yearlyVip?.title || "Yearly Member"
                      : "Yearly VIP"}
                  </span>
                </div>
                <span className="text-[11px] leading-[16px] font-[500] text-[#E2E2E2]">
                  {yearlyVip?.subTitle ||
                    "Unlimited access to all series for 1 year"}
                </span>
                <span className="font-[500] text-[9px] leading-[12px] text-white">
                  Auto renew • Cancel anytime
                </span>
              </div>
            </div>
            <div className="col-span-4  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {renderSubscriptionPrice(yearlyVip) || "$249.99"}
                </span>
                {/* {renderSubscriptionSale(yearlyVip) && (
                  <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                    {renderSubscriptionSale(yearlyVip)}
                  </span>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* DramaShort Premium */}
        <div className="flex flex-col items-start px-4 mb-10">
          <span className="text-[18px] leading-[28px] font-[600] text-white mb-4">
            Coin Store
          </span>
          <div className="grid grid-cols-12 gap-4 w-full">
            {coinPackages.length > 0 ? (
              coinPackages.slice(0, 2).map((packageItem, index) => (
                <div
                  key={packageItem.productId}
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === index
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(index)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      {packageItem.coin}
                    </span>
                    {renderCoinPackageBonus(packageItem)}
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    {packageItem.priceTitle}
                  </span>
                  {/* Bonus Badge */}
                  {shouldShowBonusBadge(packageItem) && (
                    <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[16px]">
                      {renderBonusSpecialTitle(packageItem)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Fallback for first row
              <>
                <div
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === 0
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(0)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      100
                    </span>
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      +
                    </span>
                    <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                      100
                    </span>
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    $2.99
                  </span>
                  <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[16px]">
                    BONUS 100%
                  </div>
                </div>
                <div
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === 1
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(1)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      300
                    </span>
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      +
                    </span>
                    <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                      150
                    </span>
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    $6.99
                  </span>
                  <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[14px]">
                    BONUS 50%
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-12 gap-4 w-full mt-4">
            {coinPackages.length > 2 ? (
              coinPackages.slice(2, 4).map((packageItem, index) => (
                <div
                  key={packageItem.productId}
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === index + 2
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(index + 2)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      {packageItem.coin}
                    </span>
                    {renderCoinPackageBonus(packageItem)}
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    {packageItem.priceTitle}
                  </span>
                  {/* Bonus Badge */}
                  {shouldShowBonusBadge(packageItem) && (
                    <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[14px]">
                      {renderBonusSpecialTitle(packageItem)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Fallback for second row
              <>
                <div
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === 2
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(2)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      700
                    </span>
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      +
                    </span>
                    <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                      300
                    </span>
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    $9.99
                  </span>
                </div>
                <div
                  className={`col-span-6 relative flex flex-col gap-2 p-4 bg-[#FFFFFF1A] ${
                    selectedCoinPackage === 3
                      ? "border-gradient-alt-2"
                      : "border-gradient-alt-3"
                  }`}
                  onClick={() => handleCoinPackageSelection(3)}
                >
                  <div className="flex flex-row gap-2 items-center justify-start px-5 pt-5">
                    <img src={Coin} alt="coin" />
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      1000
                    </span>
                    <span className="text-[18px] leading-[28px] font-[600] text-white">
                      +
                    </span>
                    <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                      1000
                    </span>
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    $19.99
                  </span>
                  <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[14px]">
                    BONUS 100%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
