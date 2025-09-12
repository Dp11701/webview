import { useState, useEffect } from "react";
import Close from "../assets/icons/Close-no-background.svg";
import Infinite from "../assets/icons/Infinite.svg";
import Hd from "../assets/icons/Hd.svg";
import BlockAds from "../assets/icons/BlockAds.svg";
import Video from "../assets/icons/Video.svg";
import Premium from "../assets/icons/Premium.svg";
import Star from "../assets/icons/Star.svg";
import { mock } from "../assets/data/mock";
import { useComingSoonMovies, useVipMovies } from "../hooks/useVipMovies";
import { detectPlatform, type Platform } from "../utils/platformDetection";
// import { trackingIntro } from "../utils/FirebaseUtils"; // Removed: now using ikapp.trackingEvent
import { PlanBox } from "../components/PlanBox";

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
  specialTitle?: string;
  isSpecial?: boolean;
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

export default function Store() {
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [weeklyVip, setWeeklyVip] = useState<Product | null>(null);
  const [monthlyVip, setMonthlyVip] = useState<Product | null>(null);
  const [yearlyVip, setYearlyVip] = useState<Product | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [extraInfo, setExtraInfo] = useState<ExtraInfo>({
    myCoin: 0,
    priceFor: 100,
    film_id: 0,
    episode: 0,
  });

  // Use TanStack Query to fetch VIP movies
  const { data: vipMoviesData, isLoading, error } = useVipMovies();
  const {
    data: comingSoonMoviesData,
    isLoading: isLoadingComingSoon,
    error: errorComingSoon,
  } = useComingSoonMovies();

  // Use API data if available, otherwise fallback to mock data
  const data = vipMoviesData?.statusCode === 200 ? vipMoviesData.data : mock;
  const comingSoonMovies =
    comingSoonMoviesData?.statusCode === 200 ? comingSoonMoviesData.data : mock;

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
      specialTitle: iosProduct.specialTitle || "",
      isSpecial: iosProduct.isSpecial || false,
      bonus: iosProduct.bonus,
      title: iosProduct.title,
      costIapId: iosProduct.costIapId,
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

  const renderSubscriptionPrice = (subscription: Product | null) => {
    if (platform === PLATFORM.IOS) {
      return subscription?.priceTitle?.replace("%@", "Price") || "";
    } else if (platform === PLATFORM.ANDROID) {
      return subscription?.price || "";
    }
    return "";
  };

  const renderSubscriptionSale = (subscription: Product | null) => {
    if (platform === PLATFORM.ANDROID && subscription?.sale) {
      return subscription.sale;
    }
    if (platform === PLATFORM.IOS && subscription?.sale) {
      return subscription?.sale;
    }
    return null;
  };

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
        (window as any).ikapp?.postMessage
      ) {
        (window as any).ikapp.postMessage(JSON.stringify(payloadEvent));
      } else {
        // Fallback: try both methods
        if (window.webkit?.messageHandlers?.event) {
          window.webkit.messageHandlers.event.postMessage(payloadEvent);
        } else if ((window as any).ikapp?.postMessage) {
          (window as any).ikapp.postMessage(JSON.stringify(payloadEvent));
        } else {
          console.warn("No communication bridge found for platform:", platform);
          reject(new Error("No communication bridge available"));
        }
      }
    });
  }

  const handleTracking = (event: string, params: any) => {
    // Use ikapp.trackingEvent instead of Firebase tracking
    if (window.ikapp?.trackingEvent) {
      // Convert params to string format as required by ikapp.trackingEvent
      if (window.ikapp?.trackingEvent) {
        window.ikapp.trackingEvent(event, JSON.stringify(params));
      } else {
        console.warn("ikapp.trackingEvent not available");
      }
    }
  };

  const handlePlanSelection = (plan: "weekly" | "monthly" | "yearly") => {
    setSelectedPlan(plan);
  };

  // Handler for VIP activation
  const handleVipActivation = async () => {
    // Get the selected product based on current plan
    let selectedProduct: Product | null = null;
    switch (selectedPlan) {
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

    if (selectedProduct) {
      // Track VIP activation
      handleTracking("select_product", {
        action_name: "select_product",
        premium_screen_name: "vip_default_ver1",
        product_id: selectedProduct.productId,
        product_type: "subscription",
        price:
          renderSubscriptionPrice(selectedProduct)?.replace("$", "") || "0",
        currency: selectedProduct.currency || "USD",
        film_id: extraInfo.film_id,
        episode: extraInfo.episode,
      });

      if (platform === PLATFORM.IOS) {
        // iOS: Use ikapp.purchaseProduct following the iOS script flow
        try {
          if (window.ikapp?.purchaseProduct) {
            await window.ikapp.purchaseProduct(selectedProduct.productId);
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

  // Handler for close button
  //   const handleClose = async () => {
  //     try {
  //       if (window.ikapp?.dismiss) {
  //         // Use ikapp.dismiss if available
  //         window.ikapp.dismiss();
  //       } else {
  //         // Fallback: send close event to client
  //         await sendToClient("STORE_CLOSE", {
  //           source: "store_page",
  //           timestamp: Date.now(),
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Close error:", error);
  //     }
  //   };

  // Handler for restore purchases
  const handleRestore = async () => {
    try {
      if (platform === PLATFORM.IOS && window.ikapp?.restorePurchase) {
        // iOS: Use ikapp.restorePurchase
        console.log("iOS: Calling ikapp.restorePurchase");
        const result = await window.ikapp.restorePurchase();
        console.log("iOS restore result:", result);
      } else {
        // Android or fallback: send restore event to client
        await sendToClient("RESTORE_PURCHASE", {
          source: "store_page",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Restore error:", error);
    }
  };
  useEffect(() => {
    handleTracking("screen_active", {
      action_name: "screen_active",
      premium_screen_name: "vip_default_ver1",
      product_id: null,
      product_type: null,
      price: null,
      currency: null,
      film_id: extraInfo.film_id,
      episode: extraInfo.episode,
    });
  }, []);
  // Initialize platform detection
  useEffect(() => {
    // Initialize localPromises if not exists
    if (!window.localPromises) {
      window.localPromises = {};
    }

    let detectedPlatform: Platform = "unknown";
    if (window.ikapp?.platform) {
      detectedPlatform = window.ikapp.platform as Platform;
      console.log("Platform from ikapp:", detectedPlatform);
    } else {
      detectedPlatform = detectPlatform();
      console.log("Platform from detection:", detectedPlatform);
    }

    setPlatform(detectedPlatform);

    if (window.ikapp?.onPlatformChanged) {
      window.ikapp.onPlatformChanged = (newPlatform: string) => {
        console.log("Platform changed to:", newPlatform);
        setPlatform(newPlatform as Platform);
      };
    }
  }, []);

  // Load products from window.ikapp
  useEffect(() => {
    const checkForData = () => {
      if ((window as any).ikapp?.products) {
        const rawProducts = (window as any).ikapp.products;
        const processedProducts = processProductsBasedOnPlatform(rawProducts);

        // Filter subscription products (coin = 0)
        const subscriptionProducts = processedProducts.filter(
          (product: Product) => product.coin === 0
        );

        // Find subscription products based on platform
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
          // Map iOS products by array index order instead of productId
          weeklyVip = subscriptionProducts[0]; // First item = Weekly
          monthlyVip = subscriptionProducts[1]; // Second item = Monthly
          yearlyVip = subscriptionProducts[2]; // Third item = Yearly
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
  }, [platform]); // Re-run when platform changes

  // Helper function to format release date
  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month}, ${day}`;
  };

  return (
    <div className="flex flex-col h-screen w-full relative bg-[#0D0D0E]">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0E] backdrop-blur-sm ">
        <div className="flex flex-row items-center justify-between px-4 py-4">
          <img
            src={Close}
            alt="close"
            onClick={() => {
              if (window.ikapp?.trackingEvent) {
                window.ikapp.trackingEvent(
                  "exit",
                  JSON.stringify({
                    action_name: "exit",
                    premium_screen_name: "vip_default_ver1",
                    product_id: null,
                    product_type: null,
                    price: null,
                    currency: null,
                    film_id: extraInfo.film_id,
                    episode: extraInfo.episode,
                  })
                );
              }
              if (platform === PLATFORM.IOS && window.ikapp?.dismiss) {
                window.ikapp.dismiss();
              } else {
                sendToClient("CLOSE_PREMIUM", {});
              }
            }}
            className="cursor-pointer"
          />
          <span
            onClick={handleRestore}
            className="font-[400] text-[14px] leading-[20px] underline text-[#E2E2E2] cursor-pointer"
          >
            Restore
          </span>
        </div>
      </div>

      {/* Scrollable content with top padding to account for fixed header */}
      <div className="flex-1 overflow-y-auto pb-[200px] pt-[72px]">
        {/* title */}
        <div className="flex flex-col items-center px-10 mb-[24px] w-full">
          <span className="text-[20px] leading-[28px] font-[600] text-center w-[70vw] bg-gradient-to-r from-[#FFEBC3] to-[#CA9834] inline-block text-transparent bg-clip-text">
            Become VIP to Access All Exclusive Benefits
          </span>
        </div>

        {/* subscription */}
        {/* Scrollable Content */}
        {/* Subscription */}
        <div
          className="flex flex-row gap-4 px-4 py-4 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <PlanBox
            type="weekly"
            title="Weekly VIP"
            price={
              platform === PLATFORM.IOS
                ? renderSubscriptionSale(weeklyVip) || "$19.99"
                : renderSubscriptionPrice(weeklyVip) || "$19.99"
            }
            salePrice={
              platform === PLATFORM.IOS
                ? renderSubscriptionPrice(weeklyVip) || "$24.99"
                : renderSubscriptionSale(weeklyVip) || "$24.99"
            }
            selectedPlan={selectedPlan}
            onSelect={handlePlanSelection}
          />
          <PlanBox
            type="monthly"
            title="Monthly VIP"
            price={renderSubscriptionPrice(monthlyVip) || "$36.99"}
            selectedPlan={selectedPlan}
            onSelect={handlePlanSelection}
          />
          <PlanBox
            type="yearly"
            title="Yearly VIP"
            price={renderSubscriptionPrice(yearlyVip) || "$249.99"}
            selectedPlan={selectedPlan}
            onSelect={handlePlanSelection}
          />
        </div>
        {/* Scrollable Content */}
        <span className="text-[14px] leading-[20px] font-[400] text-start text-[#9E9E9F] mx-4">
          {selectedPlan === "weekly" &&
            `${
              platform === PLATFORM.IOS
                ? renderSubscriptionSale(weeklyVip) || "$19.99"
                : renderSubscriptionPrice(weeklyVip) || "$19.99"
            } for the first week, then ${
              platform === PLATFORM.IOS
                ? renderSubscriptionPrice(weeklyVip)
                : renderSubscriptionSale(weeklyVip)
            }/Week`}
          {selectedPlan === "monthly" &&
            "Unlimited access to all series for 1 month."}
          {selectedPlan === "yearly" &&
            "Unlimited access to all series for 1 year."}
        </span>
        <div className="flex flex-col items-start px-4 pt-4">
          <div className="flex py-4 w-full gap-3 justify-start items-center border-b border-[#FFFFFF1A] overflow-hidden">
            <img src={Infinite} alt="Infinite" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Unlimited viewing
            </span>
          </div>
          <div className="flex py-4 w-full gap-3 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={Hd} alt="Hd" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              1080p HD
            </span>
          </div>
          <div className="flex py-4 w-full gap-3 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={BlockAds} alt="BlockAds" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Ad-free
            </span>
          </div>
          <div className="flex py-4 w-full gap-3 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={Video} alt="Video" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              VIP-only dramas
            </span>
          </div>
          <div className="flex py-4 w-full gap-3 justify-start items-center ">
            <img src={Premium} alt="Premium" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Exclusive Extra Clip
            </span>
          </div>
        </div>

        {/* VIP Exclusive */}
        <div className="flex flex-col items-start px-4 pt-4">
          <span className="text-[20px] leading-[28px] font-[700] text-start text-[#E2E2E2] mb-4">
            VIP Exclusive
          </span>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFEBC3]"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-center w-full py-8">
              <p className="text-[#E2E2E2] text-[14px]">
                Failed to load VIP movies. Using offline content.
              </p>
            </div>
          )}

          {/* Movies organized by date */}
          {!isLoading && (
            <div
              className="flex gap-4 overflow-x-auto w-full pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {data.map((movie) => (
                <div
                  key={movie.id}
                  className="flex gap-3"
                  onClick={() => {
                    sendToClient("SELECT_MOVIE", {
                      id: movie.id,
                    });
                  }}
                >
                  {movie.episodes.map((episode) => (
                    <div
                      key={`${movie.id}-${episode.id}`}
                      className="flex-shrink-0 w-[120px]"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-[160px] object-cover rounded-[8px]"
                        />

                        {/* VIP Corner Tag - Extra Large Triangle Top Right */}
                        <div
                          className="absolute top-0 right-0 w-[52px] h-[52px] bg-gradient-to-br from-[#FFEBC3] to-[#CA9834] rounded-tr-[8px]"
                          style={{
                            clipPath: "polygon(30% 0%, 100% 0%, 100% 70%)",
                          }}
                        >
                          <span className="absolute top-[4px] right-[4px] text-[12px] leading-[18px]  font-[500] bg-gradient-to-r from-[#47331C] via-[#997040] to-[#4F3920] inline-block text-transparent bg-clip-text transform rotate-45">
                            VIP
                          </span>
                        </div>

                        <div className="mt-2">
                          <p className="font-[500] text-[13px] leading-[18px] text-white">
                            {movie.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Section */}
        <div className="flex flex-col items-start px-4 pt-4">
          <span className="text-[20px] leading-[28px] font-[700] text-start text-[#E2E2E2] mb-4">
            Coming Soon
          </span>

          {/* Loading state */}
          {isLoadingComingSoon && (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFEBC3]"></div>
            </div>
          )}

          {/* Error state */}
          {errorComingSoon && (
            <div className="flex items-center justify-center w-full py-8">
              <p className="text-[#E2E2E2] text-[14px]">
                Failed to load coming soon movies. Using offline content.
              </p>
            </div>
          )}

          {/* Movies on single scrollable row */}
          {!isLoadingComingSoon && (
            <div
              className="flex gap-4 overflow-x-auto w-full pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {comingSoonMovies.map((movie: any) => (
                <div key={movie.id} className="flex-shrink-0 w-[120px]">
                  <div className="relative overflow-hidden">
                    {/* Date overlay */}
                    <div className=" bg-transparent rounded-[4px]  py-1 flex flex-row gap-1 items-center justify-between">
                      <span className="text-[12px] leading-[18px] font-[400] text-[#FFFFFF]">
                        {formatReleaseDate(movie.releaseDate)}
                      </span>
                      <div className="w-[60%] h-[1px] bg-[#FFFFFF]"></div>
                    </div>
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-[160px] object-cover rounded-[8px]"
                    />

                    <div className="mt-2">
                      <p className="font-[500] text-[13px] leading-[18px] text-white">
                        {movie.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips and tricks */}
        <div className="flex flex-col gap-2 text-[12px] leading-[18px] font-[400] text-[#E2E2E2] px-4 text-start">
          <span>Tips</span>
          <span>
            1. DramaOn both free and paid content. You can choose what to
            unlock.
          </span>
          <span>
            2. Reward Coins can be earned through tasks and top-up bonuses, and
            can be used like regular Coins to unlock episodes.
          </span>
          <span>
            3. Reward Coins will expire and are used first when unlocking
            content.
          </span>
          <span>
            4. Privilege: Enjoy unlimited access DramaOn during subscription.
          </span>
          <span>
            5. Activation: Subscriptions activate within 24 hours of purchase,
            pending approval from{" "}
            {platform === PLATFORM.IOS ? "App Store" : "Google Play"}.
          </span>
          <span>
            6. Auto-Renewal: Subscriptions auto-renew at original price, charged
            24 hours before each period, unless canceled.
          </span>
          <span>
            7. Cancellation: If you want to unsubscribe, please proceed to your{" "}
            {platform === PLATFORM.IOS ? "App Store" : "Google Play"} account
            and cancel your subscription at least 24 hours before the end of
            your current subscription period.
          </span>
          <span>
            8. Pricing: Various plans available with pricing based on your
            country/region.
          </span>
          <span>9. For more help, please contact us.</span>
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D0E] backdrop-blur-sm">
        <div className="flex flex-col items-center px-4 pt-4 gap-2 border-t border-[#FFFFFF1A]">
          <div className="flex items-center justify-center ">
            <img src={Star} alt="Star" />
            <img src={Star} alt="Star" />
            <img src={Star} alt="Star" />
            <img src={Star} alt="Star" />
            <img src={Star} alt="Star" />
          </div>
          <div className="flex justify-center pb-2">
            <span className="text-[14px] leading-[20px] font-[500] text-start text-white">
              4.9{" "}
              <span className="font-[400] text-[14px] leading-[20px] text-[#9E9E9F]">
                {" "}
                - 29,31k ratings{" "}
              </span>
            </span>
          </div>
          <button
            onClick={handleVipActivation}
            className="flex items-center justify-center w-full h-[48px] bg-gradient-to-r from-[#FFEBC3] to-[#CA9834] rounded-[16px] text-[18px] leading-[28px] font-[600] text-[#47331C] py-4"
          >
            Activate VIP
          </button>
          <span className="text-[14px] font-[400] leading-[20px] text-[#9E9E9F] mt-2 pb-4">
            Auto renew - Cancel anytime
          </span>
        </div>
      </div>
    </div>
  );
}
