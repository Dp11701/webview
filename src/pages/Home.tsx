import { useState, useEffect } from "react";
import Close from "../assets/icons/Close.svg";
import Coin from "../assets/icons/Coin.svg";
import Crown from "../assets/icons/crown.svg";

interface Product {
  productId: string;
  coin: number;
  index: number;
  priceTitle: string;
  subTitle: string;
  specialTitle: string;
  isSpecial: boolean;
  price: string;
  sale: string;
}

interface ExtraInfo {
  myCoin: number;
  priceFor: number;
}

export default function Home() {
  const [count, setCount] = useState(0);
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
  });

  // Lắng nghe sự kiện từ mobile
  useEffect(() => {
    const checkForProducts = () => {
      if ((window as any).ikapp?.products) {
        const products = (window as any).ikapp.products;
        console.log("Products found:", products); // Debug log

        // Tách subscription products (coin = 0)
        const subscriptionProducts = products.filter(
          (product: Product) => product.coin === 0
        );

        // Tách coin packages (coin > 0) và sắp xếp theo index
        const coinProducts = products
          .filter((product: Product) => product.coin > 0)
          .sort((a: Product, b: Product) => a.index - b.index);

        setCoinPackages(coinProducts);

        // Xử lý subscription products
        const weeklyVip = subscriptionProducts.find(
          (product: Product) => product.productId === "idrama_sub_weekly_vip_2"
        );
        if (weeklyVip) {
          console.log("Weekly VIP found:", weeklyVip);
          setWeeklyVip(weeklyVip);
        }

        const monthlyVip = subscriptionProducts.find(
          (product: Product) =>
            product.productId === "dramashort_monthly_subscription"
        );
        if (monthlyVip) {
          console.log("Monthly VIP found:", monthlyVip);
          setMonthlyVip(monthlyVip);
        }

        const yearlyVip = subscriptionProducts.find(
          (product: Product) => product.productId === "idrama_sub_yearly_vip_1"
        );
        if (yearlyVip) {
          console.log("Yearly VIP found:", yearlyVip);
          setYearlyVip(yearlyVip);
        }
      }
    };

    const checkForExtraInfo = () => {
      if ((window as any).ikapp?.extraInfo) {
        const extraInfoData = (window as any).ikapp.extraInfo;
        console.log("ExtraInfo found:", extraInfoData); // Debug log
        setExtraInfo(extraInfoData);
      }
    };

    // Kiểm tra ngay khi component mount
    checkForProducts();
    checkForExtraInfo();

    // Method 1: Event listener approach (tốt hơn polling)
    const handleProductsUpdate = (event: CustomEvent) => {
      console.log("Products updated via event:", event.detail);
      if (event.detail?.products) {
        checkForProducts();
      }
    };

    const handleExtraInfoUpdate = (event: CustomEvent) => {
      console.log("ExtraInfo updated via event:", event.detail);
      if (event.detail?.extraInfo) {
        checkForExtraInfo();
      }
    };

    // Lắng nghe custom event
    window.addEventListener(
      "productsUpdated",
      handleProductsUpdate as EventListener
    );
    window.addEventListener(
      "extraInfoUpdated",
      handleExtraInfoUpdate as EventListener
    );

    // Method 2: Watch for window.ikapp changes (fallback)
    let lastProductsLength = 0;
    let lastExtraInfo: string | null = null;
    const interval = setInterval(() => {
      if ((window as any).ikapp?.products) {
        const currentLength = (window as any).ikapp.products.length;
        // Chỉ update khi có thay đổi thực sự
        if (currentLength !== lastProductsLength) {
          console.log(
            "Products length changed:",
            lastProductsLength,
            "->",
            currentLength
          );
          lastProductsLength = currentLength;
          checkForProducts();
        }
      }

      if ((window as any).ikapp?.extraInfo) {
        const currentExtraInfo = JSON.stringify(
          (window as any).ikapp.extraInfo
        );
        if (currentExtraInfo !== lastExtraInfo) {
          console.log("ExtraInfo changed");
          lastExtraInfo = currentExtraInfo;
          checkForExtraInfo();
        }
      }
    }, 200); // Tăng interval để giảm overhead

    // Method 3: Delayed check (cho trường hợp mobile app cần thời gian setup)
    const delayedChecks = [500, 1000, 2000].map((delay) =>
      setTimeout(() => {
        console.log(`Delayed check after ${delay}ms`);
        checkForProducts();
        checkForExtraInfo();
      }, delay)
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "productsUpdated",
        handleProductsUpdate as EventListener
      );
      window.removeEventListener(
        "extraInfoUpdated",
        handleExtraInfoUpdate as EventListener
      );
      delayedChecks.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const sendMessageToMobile = () => {
    const message = {
      type: "BUTTON_CLICK",
      payload: {
        clickedAt: Date.now(),
        message: "User clicked the button!",
        count: count + 1,
      },
    };

    // 👉 Android (Kotlin) nhận qua AndroidBridge
    if ((window as any).AndroidBridge?.postMessage) {
      (window as any).AndroidBridge.postMessage(JSON.stringify(message));
    }

    // 👉 iOS (WKWebView) nhận qua messageHandlers
    if ((window as any).webkit?.messageHandlers?.ReactNativeWebView) {
      (window as any).webkit.messageHandlers.ReactNativeWebView.postMessage(
        JSON.stringify(message)
      );
    }

    setCount(count + 1);
  };

  const handlePlanSelection = (plan: "weekly" | "monthly" | "yearly") => {
    setSelectedPlan(plan);
    sendMessageToMobile();
  };

  const handleCoinPackageSelection = (index: number) => {
    setSelectedCoinPackage(index);
    sendMessageToMobile();
  };

  return (
    <div className="flex flex-col h-screen w-full mb-10">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        {/* DramaShort Premium */}
        <div className="flex flex-row items-center justify-between bg-gradient-to-b from-[#5C4E3E] to-[#141415] p-4">
          <span className="text-[18px] font-[600] leading-[28px] text-white">
            DramaShort Premium
          </span>
          <button>
            <img src={Close} alt="close" />
          </button>
        </div>

        {/* Price for this Ep: */}
        <div className="flex flex-row justify-start items-center gap-10 px-4 py-4">
          <div className=" flex flex-row gap-2">
            <span className="text-[14px] leading-[20px] font-[400] text-[#9E9E9F]">
              Price for this Ep:
            </span>
            <div className="flex flex-row gap-1">
              <img src={Coin} alt="coin" />
              <span className="text-[14px] leading-[20px] font-[500] text-[#E2E2E2]">
                {extraInfo.priceFor}
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
                {extraInfo.myCoin}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
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
            <div className="col-span-9 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Weekly VIP
                  </span>
                </div>
                <span className="text-[11px] leading-[16px] font-[500] text-[#E2E2E2]">
                  {weeklyVip?.subTitle ||
                    "Unlimited access to all series for 1 week $19.99 for the first month, then $24.99/month"}
                </span>
                <span className="font-[500] text-[9px] leading-[12px] text-white">
                  Auto renew • Cancel anytime
                </span>
              </div>
            </div>
            <div className="col-span-3  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {weeklyVip?.price || "$19.99"}
                </span>
                <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                  {weeklyVip?.sale || "$24.99"}
                </span>
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
            <div className="col-span-9 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Monthly VIP
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
            <div className="col-span-3  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {monthlyVip?.price || "36.99$"}
                </span>
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
            <div className="col-span-9 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <img src={Crown} alt="crown" />
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Yearly VIP
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
            <div className="col-span-3  p-4 rounded-lg">
              <div className="flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {yearlyVip?.price || "$249.99"}
                </span>
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
                    {packageItem.subTitle && (
                      <>
                        <span className="text-[18px] leading-[28px] font-[600] text-white">
                          +
                        </span>
                        <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                          {packageItem.subTitle.replace("+ ", "")}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    {packageItem.priceTitle}
                  </span>
                  {/* Bonus Badge */}
                  {packageItem.isSpecial && packageItem.specialTitle && (
                    <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[16px]">
                      {packageItem.specialTitle}
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
                    {packageItem.subTitle && (
                      <>
                        <span className="text-[18px] leading-[28px] font-[600] text-white">
                          +
                        </span>
                        <span className="text-[16px] font-[400] leading-[24px] text-[#E2E2E2]">
                          {packageItem.subTitle.replace("+ ", "")}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[16px] font-[400] leading-[24px] text-[#9E9E9F] px-5 pb-5">
                    {packageItem.priceTitle}
                  </span>
                  {/* Bonus Badge */}
                  {packageItem.isSpecial && packageItem.specialTitle && (
                    <div className="absolute bottom-0 right-0 border-gradient-bonus-normal text-[#FFFFFF] text-[10px] font-[600] px-3 py-2 rounded-tl-[16px] rounded-br-[14px]">
                      {packageItem.specialTitle}
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
