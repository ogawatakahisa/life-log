'use client';

import React from 'react';
import {
  useForm,
  useFieldArray,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type Item = { name: string; amount: number };

type FormValues = { date: string; items: Item[] };

const schema = yup
  .object({
    date: yup.string().required('日付は必須です'),
    items: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required('項目名は必須です'),
          amount: yup
            .number()
            .typeError('数字で入力してください')
            .min(0, '0以上の値を入力してください')
            .required('金額は必須です'),
        })
      )
      .min(1, '明細を1件以上追加してください'),
  })
  .required();

interface ExpenseFormProps {
  onSubmit: (data: FormValues & { total: number }) => void;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      items: [{ name: '', amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onFormSubmit: SubmitHandler<FormValues> = (values) => {
    const total = values.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    onSubmit({ ...values, total });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
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
        <label className="block mb-2">明細</label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex space-x-2 items-end mb-2"
          >
            <input
              {...register(`items.${index}.name` as const)}
              placeholder="項目名"
              className="flex-1 border rounded px-2 py-1"
            />
            <input
              {...register(`items.${index}.amount` as const, {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="金額"
              className="w-24 border rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              −
            </button>
          </div>
        ))}
        {errors.items && typeof errors.items?.message === 'string' && (
          <p className="text-red-500 text-sm">{errors.items.message}</p>
        )}
        <button
          type="button"
          onClick={() => append({ name: '', amount: 0 })}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          ＋ 明細追加
        </button>
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
