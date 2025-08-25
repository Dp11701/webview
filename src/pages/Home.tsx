import { useState, useEffect } from "react";
import Close from "../assets/icons/Close.svg";
import Coin from "../assets/icons/Coin.svg";
import Crown from "../assets/icons/crown.svg";

interface Product {
  product_id: string;
  price_title: string;
  cost_title: string;
}

export default function Home() {
  const [count, setCount] = useState(0);
  const [productData, setProductData] = useState<Product | null>(null);

  // Lắng nghe sự kiện từ mobile
  useEffect(() => {
    const checkForProducts = () => {
      if ((window as any).ikapp?.products) {
        const products = (window as any).ikapp.products;
        const targetProduct = products.find(
          (product: Product) =>
            product.product_id === "heart_rate_subs_yearly_no_trial"
        );
        if (targetProduct) {
          setProductData(targetProduct);
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkForProducts();

    // Lắng nghe thay đổi trên window.ikapp.products
    const interval = setInterval(checkForProducts, 100);

    return () => clearInterval(interval);
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

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      {/* DramaShort Premium */}
      <div className="flex flex-row items-center justify-between ">
        <span className="text-[18px] font-[600] leading-[28px] text-white">
          DramaShort Premium
        </span>
        <button>
          <img src={Close} alt="close" />
        </button>
      </div>

      {/* Price for this Ep: */}
      <div className="flex flex-row justify-start items-center gap-10">
        <div className=" flex flex-row gap-2">
          <span className="text-[14px] leading-[20px] font-[400] text-[#9E9E9F]">
            Price for this Ep:
          </span>
          <div className="flex flex-row gap-1">
            <img src={Coin} alt="coin" />
            <span className="text-[14px] leading-[20px] font-[500] text-[#E2E2E2]">
              100
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
              0
            </span>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-12 gap-4 border-gradient rounded-[16px] p-1"
        onClick={sendMessageToMobile}
      >
        <div className="col-span-8 p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <img src={Crown} alt="crown" />
              <span className="text-[18px] leading-[28px] font-[600] text-white">
                Weekly VIP
              </span>
            </div>
            <span className="text-[11px] leading-[16px] font-[500] text-[#E2E2E2]">
              Unlimited access to all series for 1 week $19.99 for the first
              month, then $24.99/month
            </span>
            <span className="font-[500] text-[9px] leading-[12px] text-white">
              Auto renew • Cancel anytime
            </span>
          </div>
        </div>
        <div className="col-span-4  p-4 rounded-lg">
          <div className="flex flex-col gap-1 items-center justify-center h-full">
            <span className="text-white font-[700] text-[18px] leading-[24px]">
              {productData?.price_title || "$19.99"}
            </span>
            <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
              {productData?.cost_title || "$24.99"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
