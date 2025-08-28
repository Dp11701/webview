import { useState } from "react";
import Close from "../assets/icons/Close-no-background.svg";
import Infinite from "../assets/icons/Infinite.svg";
import Hd from "../assets/icons/Hd.svg";
import BlockAds from "../assets/icons/BlockAds.svg";
import Video from "../assets/icons/Video.svg";
import Premium from "../assets/icons/Premium.svg";
import Star from "../assets/icons/Star.svg";
import { mock } from "../assets/data/mock";

export default function Store() {
  const [selectedPlan, setSelectedPlan] = useState("weekly");

  const data = mock;

  // Helper function to format release date
  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month}, ${day}`;
  };

  // Group movies by release date
  const groupedMovies = data.reduce(
    (acc: { [key: string]: typeof data }, movie) => {
      const dateKey = formatReleaseDate(movie.releaseDate);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(movie);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col h-screen w-full relative bg-[#0D0D0E]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[200px]">
        {/* header */}
        <div className="flex flex-row items-center justify-between px-4 py-4">
          <img src={Close} alt="close" />
          <span className="font-[400] text-[14px] leading-[20px] underline text-[#E2E2E2]">
            Restore
          </span>
        </div>
        {/* title */}
        <div className="flex flex-col items-center px-10 mb-10 w-full">
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
          <div
            className={`flex flex-col gap-2 items-center ${
              selectedPlan === "weekly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1 min-w-[40vw] h-auto py-4 cursor-pointer`}
            onClick={() => setSelectedPlan("weekly")}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Weekly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row gap-1 items-center justify-center ">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {weeklyVip?.price_title || "$19.99"} */}
                  $19.99
                </span>
                <span className="text-[16px] leading-[24px] font-[500] text-[#E2E2E2] line-through">
                  {/* {weeklyVip?.cost_title || "$24.99"} */}
                  $24.99
                </span>
              </div>
            </div>
          </div>
          <div
            className={`gap-2 ${
              selectedPlan === "monthly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1 min-w-[40vw] flex flex-col justify-center items-center py-4 cursor-pointer`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Monthly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row justify-between gap-1 items-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {monthlyVip?.price_title || "36.99$"} */}
                  36.99$
                </span>
              </div>
            </div>
          </div>
          <div
            className={`gap-4 ${
              selectedPlan === "yearly"
                ? "border-gradient"
                : "border-gradient-alt"
            } rounded-[16px] p-1 min-w-[40vw] py-4 flex flex-col justify-center items-center cursor-pointer`}
            onClick={() => setSelectedPlan("yearly")}
          >
            <div className="px-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2 items-center">
                  <span className="text-[18px] leading-[28px] font-[600] text-white">
                    Yearly VIP
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 rounded-lg">
              <div className="flex flex-row justify-between gap-1 items-center h-full">
                <span className="text-white font-[700] text-[18px] leading-[24px]">
                  {/* {yearlyVip?.price_title || "$249.99"} */}
                  $249.99
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Scrollable Content */}
        <span className="text-[14px] leading-[20px] font-[400] text-start text-[#9E9E9F] mx-4">
          {selectedPlan === "weekly" &&
            "$14.99 for the first week, then $19.99/Week"}
          {selectedPlan === "monthly" &&
            "Unlimited access to all series for 1 month."}
          {selectedPlan === "yearly" &&
            "Unlimited access to all series for 1 year."}
        </span>
        <div className="flex flex-col items-start px-4 pt-4">
          <div className="flex py-4 w-full gap-2 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={Infinite} alt="Infinite" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Unlimited viewing
            </span>
          </div>
          <div className="flex py-4 w-full gap-2 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={Hd} alt="Hd" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              1080p HD
            </span>
          </div>
          <div className="flex py-4 w-full gap-2 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={BlockAds} alt="BlockAds" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Ad-free
            </span>
          </div>
          <div className="flex py-4 w-full gap-2 justify-start items-center border-b border-[#FFFFFF1A]">
            <img src={Video} alt="Video" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              VIP-only dramas
            </span>
          </div>
          <div className="flex py-4 w-full gap-2 justify-start items-center ">
            <img src={Premium} alt="Premium" />
            <span className="text-[16px] leading-[24px] font-[400] text-start text-[#E2E2E2]">
              Exclusive Extra Clip
            </span>
          </div>
        </div>

        {/* VIP Exclusive */}
        <div className="flex flex-col items-start px-4 pt-4">
          <span className="text-[16px] leading-[24px] font-[600] text-start text-[#E2E2E2] mb-4">
            VIP Exclusive
          </span>
          {/* Movies organized by date */}
          <div
            className="flex gap-4 overflow-x-auto w-full pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {data.map((movie) => (
              <div key={movie.id} className="flex gap-3">
                {movie.episodes.map((episode) => (
                  <div
                    key={`${movie.id}-${episode.id}`}
                    className="flex-shrink-0 w-[120px]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={episode.bannerUrl}
                        alt={episode.title}
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
        </div>

        {/* Coming Soon Section */}
        <div className="flex flex-col px-4 pt-6 pb-4">
          <h2 className="text-[24px] font-[600] text-white mb-6">
            Coming Soon
          </h2>

          {/* Movies organized by date */}
          <div className="space-y-6">
            {Object.entries(groupedMovies).map(([date, movies]) => (
              <div key={date}>
                <div className="flex items-center mb-4">
                  <div className="w-[1px] h-[16px] bg-white mr-3"></div>
                  <span className="text-[14px] font-[400] text-white">
                    {date}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {movies.map((movie) => (
                    <div key={movie.id} className="flex-shrink-0 w-[120px]">
                      <div className="relative">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-[160px] object-cover rounded-[8px]"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-[8px]">
                          <p
                            className="text-white text-[12px] font-[500] leading-[16px]"
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {movie.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips and tricks */}
        <div className="flex flex-col gap-2 text-[12px] leading-[18px] font-[400] text-[#E2E2E2] px-4 text-start">
          <span>Tips</span>
          <span>
            1.Dramashort offers both free and paid content. You can choose what
            to unlock.
          </span>
          <span>
            2.Reward Coins can be earned through tasks and top-up bonuses, and
            can be used like regular Coins to unlock episodes.
          </span>
          <span>
            3.Reward Coins will expire and are used first when unlocking
            content.
          </span>
          <span>
            4.Privilege: Enjoy unlimited access to Dramashort series during
            subscription.
          </span>
          <span>
            5. Activation: Subscriptions activate within 24 hours of purchase,
            pending approval from Google Play.
          </span>
          <span>
            6. Auto-Renewal: Subscriptions auto-renew at original price, charged
            24 hours before each period, unless canceled.
          </span>
          <span>
            7.Cancellation: If you want to unsubscribe, please proceed to your
            Google Play account and cancel your subscription at least 24 hours
            before the end of your current subscription period.
          </span>
          <span>
            8.Pricing: Various plans available with pricing based on your
            country/region.
          </span>
          <span>9.For more help, please contact us.</span>
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
          <button className="flex items-center justify-center w-full h-[48px] bg-gradient-to-r from-[#FFEBC3] to-[#CA9834] rounded-[16px] text-[18px] leading-[28px] font-[600] text-[#47331C] py-4">
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
