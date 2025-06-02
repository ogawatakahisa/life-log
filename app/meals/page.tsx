'use client';
import React, { useState } from 'react';
import MealForm from '../../components/MealForm';
import { supabase } from '../../lib/supabase';

type FormValues = {
  date: Date;
  type: '朝' | '昼' | '夜' | '間食';
  content: string;
  calories: number;
};

export default function MealsPage() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (data: FormValues) => {
    const { date, type, content, calories } = data;
    const dateStr = date.toISOString().split('T')[0];
    const { data: existing, error: selectError } = await supabase
      .from('meals')
      .select('id')
      .eq('date', dateStr)
      .eq('type', type)
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error(selectError);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('meals')
        .update({ content, calories })
        .eq('id', existing.id);

      if (updateError) {
        console.error(updateError);
        return;
      }
      setMessage('更新しました');
    } else {
      const { error: insertError } = await supabase
        .from('meals')
        .insert({ date: dateStr, type, content, calories });

      if (insertError) {
        console.error(insertError);
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
      <MealForm onSubmit={handleSubmit} />
    </div>
  );
}
