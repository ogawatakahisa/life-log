'use client';

import React, { useState } from 'react';
import ExpenseForm from '../../components/ExpenseForm';
import { supabase } from '../../lib/supabase';

type Item = { name: string; amount: number };
type FormValues = { date: string; items: Item[]; total: number };

export default function ExpensesPage() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (data: FormValues) => {
    const { date, items, total } = data;
    const dateStr = date;
    const { data: existing, error: selectError } = await supabase
      .from('expenses')
      .select('id')
      .eq('date', dateStr)
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error(selectError);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ items, total })
        .eq('id', existing.id);

      if (updateError) {
        console.error(updateError);
        setMessage('更新に失敗しました');
        return;
      }
      setMessage('更新しました');
    } else {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert({ date: dateStr, items, total });

      if (insertError) {
        console.error(insertError);
        setMessage('保存に失敗しました');
        return;
      }
      setMessage('保存しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {message && (
        <div className="mb-4 text-center text-green-600">{message}</div>
      )}
      <ExpenseForm onSubmit={handleSubmit} />
    </div>
  );
}
