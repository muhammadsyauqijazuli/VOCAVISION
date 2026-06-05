"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: {
    rendah: number;
    netral: number;
    tinggi: number;
  };
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function RiskDistributionChart({ data }: PropsType) {
  const isMobile = useIsMobile();

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#E74C3C", "#F39C12", "#3BA99C"],
    labels: ["Rendah", "Netral", "Tinggi"],
    legend: {
      position: "bottom",
      labels: {
        colors: undefined,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 280,
          },
        },
      },
    ],
  };

  return (
    <div className="h-80">
      <Chart
        options={options}
        series={[data.rendah, data.netral, data.tinggi]}
        type="donut"
        height={isMobile ? 280 : 320}
      />
    </div>
  );
}
