"use client";

import { useState, useRef, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { writeContractAsync, isPending: isLoadingBlockchain } = useScaffoldWriteContract("ConfidentialReporter");

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: Message = { role: "user", content: userInput };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserInput("");
    setIsLoadingAI(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to get response from server.");
      const data = await response.json();
      setMessages(prev => [...prev, data.reply]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: "assistant", content: "Sorry, an error occurred. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (messages.length === 0) {
      alert("Cannot submit an empty report.");
      return;
    }
    try {
      await writeContractAsync({
        functionName: "submitReport",
        args: [JSON.stringify(messages)],
      });
      alert("Report successfully and securely submitted to the blockchain!");
      setMessages([]);
    } catch (error) {
      console.error("Error submitting to blockchain:", error);
      alert("Failed to submit report. Please ensure your wallet is connected and you have enough funds for gas.");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Aman Report</h1>
          <p className="text-lg">A Secure and Confidential Space to Document Your Experience</p>
          <div className="mt-2 p-2 bg-warning text-warning-content rounded-md text-sm">
            <p>
              <strong>Disclaimer:</strong> This is an AI assistant, not a human professional.
            </p>
            <p>
              If you need immediate help, contact <strong>WAO: +603 3000 8858</strong>
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <RainbowKitCustomConnectButton />
        </div>

        {connectedAddress && (
          <div className="bg-base-200 border-base-300 border shadow-md rounded-lg p-4 flex flex-col h-[60vh]">
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2">
              {messages.map((msg, index) => (
                <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                  <div className="chat-bubble">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoadingAI && (
                <div className="chat chat-start">
                  <div className="chat-bubble">
                    <span className="loading loading-dots loading-md"></span>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="input input-bordered flex-grow"
                disabled={isLoadingAI || isLoadingBlockchain}
              />
              <button type="submit" className="btn btn-primary" disabled={isLoadingAI || isLoadingBlockchain}>
                Send
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                className="btn btn-accent"
                onClick={handleSubmitToBlockchain}
                disabled={isLoadingBlockchain || messages.length === 0}
              >
                {isLoadingBlockchain ? "Finalizing on Blockchain..." : "Finalize & Encrypt Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
