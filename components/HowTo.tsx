'use client';

import React from 'react';

export const HowTo = () => {
  const steps = [
    {
      title: 'CONNECT WALLET',
      description: 'Tap the wallet icon at the top to connect your Solana wallet and start your mining journey.'
    },
    {
      title: 'PICK YOUR SQUARES',
      description: 'Select one or more squares on the grid. Each square represents a chance to find the jackpot!'
    },
    {
      title: 'CHOOSE YOUR STAKE',
      description: 'Adjust your mining amount using the +/- buttons. More stake means bigger potential rewards.'
    },
    {
      title: 'HIT THE MINE BUTTON',
      description: 'When you\'re ready, press MINE! Your entries will be deployed for the current round.'
    },
    {
      title: 'COLLECT REWARDS',
      description: 'Once the timer hits zero, check the results and claim your SOL and QUEST winnings!'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-4 mt-12 pb-12">
      <div className="flex flex-col items-center justify-center mb-2">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          How to Mine
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cq-primary-yellow to-transparent mt-1" />
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="cq-panel p-4 flex items-center gap-4 transition-transform hover:scale-[1.02]"
            style={{
              background: 'black',
              borderColor: 'rgba(255, 184, 74, 0.2)'
            }}
          >
            {/* Step Number Circle */}
            <div className="flex-none w-10 h-10 rounded-full bg-[#FFB84A] border-2 border-[rgb(120,63,4)] flex items-center justify-center shadow-[0_3px_0_rgb(120,63,4)]">
              <span className="text-lg font-black text-[rgb(120,63,4)] leading-none">{index + 1}</span>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="text-sm font-black text-[#FFB84A] uppercase tracking-wider leading-none">
                {step.title}
              </h3>
              <p className="text-xs font-bold text-white/80 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 cq-panel p-4 text-center border-dashed border-2 border-[#FFB84A]/30">
        <p className="text-[10px] font-black text-[#FFB84A]/60 uppercase tracking-widest">
          Happy Mining, Critter!
        </p>
      </div>
    </div>
  );
};

