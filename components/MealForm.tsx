'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type FormValues = {
  date: Date;
  type: '朝' | '昼' | '夜' | '間食';
  content: string;
  calories: number;
};

const schema = yup
  .object({
    date: yup
      .date()
      .transform((value, originalValue) => (originalValue ? new Date(originalValue) : value))
      .required('日付は必須です'),
    type: yup
      .string()
      .oneOf(['朝', '昼', '夜', '間食'])
      .required('食事タイプは必須です'),
    content: yup.string().required('内容は必須です'),
    calories: yup
      .number()
      .typeError('カロリーは数値で入力してください')
      .integer('整数で入力してください')
      .required('カロリーは必須です'),
  })
  .required();

interface MealFormProps {
  onSubmit: (data: FormValues) => void;
}

export default function MealForm({ onSubmit }: MealFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto p-4 bg-white shadow rounded"
    >
      <div>
        <label className="block mb-1">日付</label>
        <input
          type="date"
          {...register('date')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">食事タイプ</label>
        <select
          {...register('type')}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">選択してください</option>
          <option value="朝">朝</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="間食">間食</option>
        </select>
        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">内容</label>
        <textarea
          {...register('content')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">カロリー</label>
        <input
          type="number"
          {...register('calories')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.calories && (
          <p className="text-red-500 text-sm">{errors.calories.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        保存
      </button>
    </form>
  );
}
