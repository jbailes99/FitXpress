"use client";
import React, { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  ArrowUpCircleIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
  PlusSmallIcon,
} from "@heroicons/react/20/solid";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { getCurrentTokens, getUserDetails } from "@/utils/authService";

import { Button } from "@/components/button";

const secondaryNavigation = [
  { name: "Last 7 days", href: "#", current: true },
  { name: "Last 30 days", href: "#", current: false },
  { name: "All-time", href: "#", current: false },
];
const stats = [
  { name: "Body Fat", value: "", change: "+4.75%", changeType: "positive" },
  { name: "BMI", value: "", change: "+1.02%", changeType: "negative" },
  { name: "Lean Mass", value: "", change: "-1.39%", changeType: "positive" },
  { name: "Fat Mass", value: "", change: "+10.18%", changeType: "negative" },
];
import { Line } from "react-chartjs-2";
import { LinearScale, CategoryScale } from "chart.js";
import { Chart as ChartJS, registerables } from "chart.js";
import { Chart } from "react-chartjs-2";
ChartJS.register(...registerables);

const chartData = {
  labels: ["Label 1", "Label 2", "Label 3"],
  datasets: [
    {
      label: "My Dataset",
      data: [10, 20, 15],
    },
  ],
};

const chartOptions = {
  scales: {
    x: {
      type: "category",
    },
    y: {
      beginAtZero: true,
    },
  },
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Results() {
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [age, setAge] = useState<number | undefined>(undefined);
  const [neckMeasurement, setNeckMeasurement] = useState<number | undefined>(
    undefined
  );
  const [waistMeasurement, setWaistMeasurement] = useState<number | undefined>(
    undefined
  );
  const [height, setHeight] = useState<string | undefined>(undefined);
  const [bodyFatBMI, setBodyFatBMI] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false); // set to false
  const [showMoreInfo, setShowMoreInfo] = useState(false); // set to false
  const [bmi, setBmi] = useState<number | null>(null);
  const [open, setOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bodyFatCalc, setBodyFatCalc] = useState<number | null>(null);
  const [bodyFatMass, setBodyFatMass] = useState<number | null>(null);
  const [bodyLeanMass, setBodyLeanMass] = useState<number | null>(null);
  const [bodyBMI, setBodyBMI] = useState<number | null>(null);
  const [results, setResults] = useState<any>([]);
  interface ResultItem {
    userId: string;
    bodyLeanMass: number;
    bodyFatCalc: number;
    timestamp: string;
    bodyFatMass: number;
    // Add more fields as needed
  }
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  });

  const apiEndpoint =
    "https://lm6vr3st47.execute-api.us-east-1.amazonaws.com/default/test";

  const bmiRanges = [
    { label: "Underweight", min: 15, max: 18.5 },
    { label: "Normal Weight", min: 18.6, max: 24.9 },
    { label: "Overweight", min: 25, max: 29.9 },
    { label: "Obese", min: 30, max: 50 },
  ];

  const bmiData = {
    labels: bmiRanges.map((range) => range.label),
    datasets: [
      {
        data: bmiRanges.map((range) => (range.min + range.max) / 2),
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(75,192,192,1)",
        pointRadius: 6,
      },
      {
        data: [bmi || bodyBMI],
        borderColor: "rgba(255, 0, 0, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 0, 0, 1)",
        pointRadius: 8,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 15,
        max: 50, // Adjust the maximum value as needed
        title: {
          display: true,
          text: "BMI",
        },
      },
    },
  };

  const lambdaEndpoint =
    "https://64dktx24d8.execute-api.us-east-1.amazonaws.com/default/getCalculationResults";

  const deleteEndpoint =
    "https://g1v3jlh2g5.execute-api.us-east-1.amazonaws.com/default/deleteCalculationResult";

  const handleDelete = async (entryId) => {
    try {
      const storedTokens = getCurrentTokens();
      const userDetails = await getUserDetails(storedTokens.accessToken);
      const userId = userDetails.username;

      console.log("Deleting item with entryId:", entryId);
      const response = await api.post(deleteEndpoint, { entryId, userId });
      console.log("Response from lambda:", response.data);
      alert("Calculation entry deleted.");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const storedTokens = getCurrentTokens();

        if (!storedTokens || !storedTokens.accessToken) {
          console.error("Access token is missing for saving results.");
          return;
        }

        const userDetails = await getUserDetails(storedTokens.accessToken);
        const userId = userDetails.username;

        const response = await api.post(lambdaEndpoint, { userId });

        // Access the data from the response
        const responseData = response.data.items;
        setResults(responseData);

        // Process and use responseData as needed
        console.log("Fetched data:", responseData);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
  }, []);

  // Call handleDelete when needed, passing results as a parameter

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <>
        <main>
          <div className="">
            <div className=" bg-secondary-400 mx-4 my-4  rounded-xl  relative isolate overflow-hidden ">
              {/* Secondary navigation */}
              <div className="flex justify-center rounded-t-none ">
                <div className="flex bg-gray-800 w-1/16 px-4 justify-center space-x-12 pb-2 rounded-b-xl ">
                  <button className="bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded">
                    Body Metrics
                  </button>
                  <button className="bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded">
                    Exercises
                  </button>
                </div>
              </div>

              <header className="pb-4 pt-6 sm:pb-6">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-semibold leading-7 text-gray-300">
                    Results
                  </h1>
                  <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:leading-7">
                    {secondaryNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={
                          item.current ? "text-indigo-600" : "text-gray-300"
                        }
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </header>

              {/* Stats */}
              <div className="border-b border-b-gray-500/30 lg:border-t lg:border-t-gray-500/30">
                <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
                  {stats.map((stat, statIdx) => (
                    <div
                      key={stat.name}
                      className={classNames(
                        statIdx % 2 === 1
                          ? "sm:border-l"
                          : statIdx === 2
                          ? "lg:border-l"
                          : "",
                        "flex items-baseline flex-wrap justify-between gap-y-2 gap-x-12 border-t border-gray-500/30 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8"
                      )}
                    >
                      <dt className="text-sm font-medium leading-6 text-gray-300">
                        {stat.name}
                      </dt>
                      <dd
                        className={classNames(
                          stat.changeType === "negative"
                            ? "text-green-400"
                            : "text-gray-300",
                          "text-xs font-medium",
                          stat.changeType === "positive"
                            ? "text-rose-600"
                            : "text-gray-300",
                          "text-xs font-medium"
                        )}
                      >
                        {stat.change}
                        <Line data={chartData} options={chartOptions as any} />
                      </dd>
                      <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-300">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div
                className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
                aria-hidden="true"
              >
                <div
                  className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
                  style={{
                    clipPath:
                      "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
                  }}
                />
              </div>
            </div>

            <div className="bg-secondary-400 rounded-xl m-4 space-y-16 py-16 xl:space-y-20">
              {/* Recent activity table */}
              <div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-300 lg:mx-0 lg:max-w-none">
                    Recent activity
                  </h2>
                  <div className="results-container">
                    {results
                      .sort(
                        // @ts-ignore
                        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                      ) // Sort by timestamp
                      .map((item, index) => (
                        <div
                          key={index}
                          className="bg-secondary-100 text-white"
                          style={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            padding: "20px",
                            marginBottom: "20px",
                          }}
                        >
                          <p style={{ fontSize: "16px", margin: "5px 0" }}>
                            <strong>{item.timestamp}</strong>
                          </p>
                          <h2
                            style={{ fontSize: "18px", marginBottom: "10px" }}
                          >
                            <strong>{item.userId}</strong>
                          </h2>
                          <p
                            style={{ fontSize: "16px", marginBottom: "5px 0" }}
                          >
                            BMI: {item.bodyBMI}
                          </p>
                          <p style={{ fontSize: "16px", margin: "5px 0" }}>
                            Body Lean Mass: {item.bodyLeanMass}
                          </p>
                          <p style={{ fontSize: "16px", margin: "5px 0" }}>
                            Body Fat Calculation: {item.bodyFatCalc}
                          </p>
                          <p style={{ fontSize: "16px", margin: "5px 0" }}>
                            Body Fat Mass: {item.bodyFatMass}
                          </p>
                          <p style={{ fontSize: "16px", margin: "5px 0" }}>
                            entryId: {item.entryId}
                          </p>

                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(item.entryId);
                            }}
                            className="bg-red-600 text-gray-200 rounded shadow"
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    </motion.div>
  );
}
