"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabase } from "../../lib/supabase";

type FormValues = {
  date: string;
  content: string;
};

const schema = yup
  .object({
    date: yup.string().required("Date is required"),
    content: yup
      .string()
      .required("Content is required")
      .max(1000, "Content must be 1000 characters or less"),
  })
  .required();

export default function Page() {
  const today = new Date().toISOString().split("T")[0];
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { date: today, content: "" },
  });

  const dateValue = watch("date");
  const [message, setMessage] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      setMessage(null);
      const { data, error } = await supabase
        .from("journals")
        .select("content")
        .eq("date", dateValue)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error(error);
        return;
      }
      if (data) {
        setValue("content", data.content);
        setExists(true);
      } else {
        setValue("content", "");
        setExists(false);
      }
    }
    loadEntry();
  }, [dateValue, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async ({ date, content }) => {
    setMessage(null);
    if (exists) {
      const { error } = await supabase
        .from("journals")
        .update({ content })
        .eq("date", date);
      if (error) {
        console.error(error);
        setMessage("Error updating entry");
      } else {
        setMessage("更新しました");
      }
    } else {
      const { error } = await supabase
        .from("journals")
        .insert({ date, content });
      if (error) {
        console.error(error);
        setMessage("Error saving entry");
      } else {
        setMessage("保存しました");
        setExists(true);
      }
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ジャーナル</h1>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="date" className="block font-medium mb-1">
            日付
          </label>
          <input
            type="date"
            id="date"
            {...register("date")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="content" className="block font-medium mb-1">
            本文
          </label>
          <textarea
            id="content"
            {...register("content")}
            className="border rounded px-2 py-1 w-full h-40"
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            保存
          </button>
        </div>
      </form>
    </main>
  );
}
