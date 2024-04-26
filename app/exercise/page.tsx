"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api"; // Import your API utility function

type ExerciseEntry = {
  id: number;
  type: string;
  reps: string;
  additionalInfo: string;
};

const ExerciseTracker = () => {
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);
  const [newExerciseEntry, setNewExerciseEntry] = useState({
    type: "",
    reps: "",
    additionalInfo: "",
  });

  const fetchUrl =
    "https://yvxqyykabg.execute-api.us-east-1.amazonaws.com/default/getExerciseType";
  useEffect(() => {
    // Fetch exercise types for the selected category
    const fetchExerciseData = async () => {
      try {
        const response = await api.get(fetchUrl); // Adjust the endpoint accordingly
        const { items } = response.data;
        const extractedCategories = Array.from(
          new Set(items.map((item) => item.exerciseCategory.S))
        );
        const extractedExerciseTypes = Array.from(
          new Set(items.map((item) => item.exerciseType.S))
        );
        // Set the state variables with the extracted data
        setCategories(extractedCategories);
        setExerciseTypes(extractedExerciseTypes);
      } catch (error) {
        console.error(
          `Error fetching exercise types for category ${selectedCategory}:`,
          error
        );
      }
    };

    fetchExerciseData();
  }, []);

  const handleExerciseSubmit = () => {
    // Add new exercise entry to the exerciseEntries state
    setExerciseEntries((prevEntries: ExerciseEntry[]) => [
      ...prevEntries,
      { id: prevEntries.length + 1, ...newExerciseEntry },
    ]);

    // Clear new exercise entry input
    setNewExerciseEntry({ type: "", reps: "", additionalInfo: "" });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="flex items-center justify-center px-4 py-8 sm:p-6">
        <div className="items-center justify-center mt-2 max-w-4xl text-sm text-white">
          <div className="bg-secondary-400 p-12 rounded-xl mt-6 flex flex-col gap-x-12 gap-y-20 lg:flex-row">
            <div className="lg:w-3/4 lg:max-w-screen-2xl lg:flex-auto">
              <h1 className="text-6xl font-extrabold text-white mb-4">
                Exercise Tracker
              </h1>

              <div className="mt-24 text-black">
                {/* Workout category dropdown */}
                <select
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled>
                    Select a Workout Category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Exercise type dropdown */}
                {selectedCategory && (
                  <select
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    value={newExerciseEntry.type}
                    onChange={(e) =>
                      setNewExerciseEntry({
                        ...newExerciseEntry,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select an Exercise Type
                    </option>
                    {exerciseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}

                {newExerciseEntry.type && ( // Check if an exercise type is selected
                  <input
                    type="text"
                    placeholder="Reps"
                    className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                    value={newExerciseEntry.reps}
                    onChange={(e) =>
                      setNewExerciseEntry({
                        ...newExerciseEntry,
                        reps: e.target.value,
                      })
                    }
                  />
                )}
                {newExerciseEntry.type && ( // Check if an exercise type is selected
                  <input
                    type="text"
                    placeholder="Additional Info"
                    className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                    value={newExerciseEntry.additionalInfo}
                    onChange={(e) =>
                      setNewExerciseEntry({
                        ...newExerciseEntry,
                        additionalInfo: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {/* New exercise entry input */}
              <div className="mt-4">
                {/* Input fields for reps and additional info */}
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
                  onClick={handleExerciseSubmit}
                >
                  Log Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex-col cols-3 justify-content-center item-center">
          <div className="bg-secondary-400 rounded-xl text-white text-3xl font-bold text-center  w-1/2 col-span-1">
            Weekly Planner
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseTracker;
