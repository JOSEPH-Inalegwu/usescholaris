import { createContext, useContext, useState, type ReactNode } from 'react';

interface OnboardingData {
    level?: string;
    faculty?: string;
    department?: string;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (newData: Partial<OnboardingData>) => void;
    clearData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<OnboardingData>({});

    const updateData = (newData: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const clearData = () => {
        setData({});
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, clearData }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
