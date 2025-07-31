"use client";

import React, { createContext, useContext, useState } from "react";

const LeadTypeFilterContext = createContext<{
  selectedLeadType: string;
  setSelectedLeadType: (type: string) => void;
}>({
  selectedLeadType: "",
  setSelectedLeadType: () => {},
});

export const LeadTypeFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLeadType, setSelectedLeadType] = useState<string>("");
  return (
    <LeadTypeFilterContext.Provider value={{ selectedLeadType, setSelectedLeadType }}>
      {children}
    </LeadTypeFilterContext.Provider>
  );
};

export const useLeadTypeFilter = () => useContext(LeadTypeFilterContext); 