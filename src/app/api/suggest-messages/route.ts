import { AIContext } from "@/context/AIContext";
import { useContext } from "react";

const { onSent, recentPrompt, showResult, loading, resultData, setInput, input } = useContext(AIContext)