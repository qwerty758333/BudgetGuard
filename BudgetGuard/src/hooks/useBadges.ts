import { useEffect, useRef, useState } from 'react';

import { checkBadges, type Budgets, type Expense } from '../utils/badges';


export interface UseBadgesExpense {

id: string | number;

amount: number;

category: string;

date: string;

notes: string;

}


export type UseBadgesBudgets = Record<string, number>;


export interface UseBadgesResult {

earnedBadges: string[];

newlyEarned: string[];

}


function toCheckBudgets(budgets: UseBadgesBudgets): Budgets {

return {

total: Object.values(budgets).reduce((sum, amount) => sum + amount, 0),

};

}


export function useBadges(

expenses: UseBadgesExpense[],

budgets: UseBadgesBudgets,

): UseBadgesResult {

const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

const [newlyEarned, setNewlyEarned] = useState<string[]>([]);

const previousBadgesRef = useRef<string[]>([]);

const isInitializedRef = useRef(false);


useEffect(() => {

const currentEarned = checkBadges(expenses as Expense[], toCheckBudgets(budgets));

const previousEarned = previousBadgesRef.current;


if (isInitializedRef.current) {

const newBadges = currentEarned.filter((id) => !previousEarned.includes(id));

if (newBadges.length > 0) {

setNewlyEarned(newBadges);

}

}


setEarnedBadges(currentEarned);

previousBadgesRef.current = currentEarned;

isInitializedRef.current = true;

}, [expenses, budgets]);


useEffect(() => {

if (newlyEarned.length === 0) {

return;

}


const timer = window.setTimeout(() => {

setNewlyEarned([]);

}, 3000);


return () => window.clearTimeout(timer);

}, [newlyEarned]);


return { earnedBadges, newlyEarned };

}