import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Flame, TrendingDown, TrendingUp } from "lucide-react";

const activityOptions = [
  { label: "デスクワーク中心（ほとんど運動しない）", value: 1.2 },
  { label: "軽い運動（週1〜2回）", value: 1.375 },
  { label: "中強度の運動（週3〜5回）", value: 1.55 },
  { label: "高強度の運動（週5〜6回）", value: 1.725 },
  { label: "アスリートレベル（1日2回）", value: 1.9 },
];

function roundToNearest5(num: number) {
  return Math.round(num / 5) * 5;
}

function calculateBMR({
  sex,
  age,
  height,
  weight,
  bodyFat,
}: {
  sex: string;
  age: number;
  height: number;
  weight: number;
  bodyFat?: number | null;
}) {
  // 体脂肪率がある場合はKatch-McArdle、ない場合はMifflin-St Jeor
  if (bodyFat !== null && bodyFat !== undefined && !Number.isNaN(bodyFat) && bodyFat > 0 && bodyFat < 70) {
    const leanBodyMass = weight * (1 - bodyFat / 100);
    return 370 + 21.6 * leanBodyMass;
  }

  if (sex === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export default function TDEEToolApp() {
  const [screen, setScreen] = useState<"form" | "result">("form");
  const [form, setForm] = useState({
    sex: "male",
    age: "25",
    height: "170",
    weight: "65",
    bodyFat: "",
    activity: "1.2",
  });

  const parsed = useMemo(() => {
    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);
    const bodyFat = form.bodyFat === "" ? null : Number(form.bodyFat);
    const activity = Number(form.activity);

    if (!age || !height || !weight || !activity) return null;
    if (age <= 0 || height <= 0 || weight <= 0) return null;

    const bmr = calculateBMR({
      sex: form.sex,
      age,
      height,
      weight,
      bodyFat,
    });

    const tdee = bmr * activity;

    const bmi = weight / ((height / 100) * (height / 100));

    const cutLow = tdee - weight * 7.7; // 約0.7%/週あたりの中間目安
    const cutHigh = tdee - weight * 11; // 約1.0%/週
    const cutMild = tdee - weight * 5.5; // 約0.5%/週

    const gainLow = tdee + weight * 2.75; // 約0.25%/週
    const gainHigh = tdee + weight * 5.5; // 約0.5%/週

    const activityCalories = activityOptions.map((option) => ({
      label: option.label,
      value: option.value,
      calories: roundToNearest5(bmr * option.value),
      isSelected: option.value === activity,
    }));

    const bmiCategory =
      bmi < 18.5 ? "低体重" :
      bmi < 25 ? "普通体重" :
      bmi < 30 ? "肥満（1度）" : "肥満";

    return {
      bmi,
      bmiCategory,
      age,
      height,
      weight,
      bodyFat,
      activity,
      bmr,
      tdee,
      activityCalories,
      maintain: roundToNearest5(tdee),
      maintainWeekly: roundToNearest5(tdee * 7),
      cutRange: {
        low: roundToNearest5(cutHigh),
        high: roundToNearest5(cutMild),
        center: roundToNearest5(cutLow),
      },
      gainRange: {
        low: roundToNearest5(gainLow),
        high: roundToNearest5(gainHigh),
      },
    };
  }, [form]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!parsed) return;
    setScreen("result");
  };

  const isValid = !!parsed;

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-4 md:p-8">
      <div className="mx-auto max-w-md md:max-w-2xl">
        {screen === "form" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-[28px] shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-2 px-5 pt-6 sm:px-6">
                <CardTitle className="flex items-center gap-3 text-[26px] sm:text-3xl font-bold tracking-tight">
                  <Calculator className="h-7 w-7" />
                  TDEE計算ツール
                </CardTitle>
                <p className="text-sm text-slate-600 leading-relaxed">
                  1日の消費カロリー（TDEE）を計算します。BMIや基礎代謝などもあわせて確認できます。
                </p>
              </CardHeader>

              <CardContent className="space-y-5 px-5 pb-6 pt-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>性別</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange("sex", "male")}
                        className={`h-12 rounded-2xl text-base font-medium ${form.sex === "male" ? "bg-black text-white" : "bg-white border"}`}
                      >
                        男性
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("sex", "female")}
                        className={`h-12 rounded-2xl text-base font-medium ${form.sex === "female" ? "bg-black text-white" : "bg-white border"}`}
                      >
                        女性
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>年齢</Label>
                    <Input
                      className="h-12 rounded-2xl text-base"
                      type="number"
                      value={form.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      placeholder="25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>身長 (cm)</Label>
                    <Input
                      className="h-12 rounded-2xl text-base"
                      type="number"
                      value={form.height}
                      onChange={(e) => handleChange("height", e.target.value)}
                      placeholder="170"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>体重 (kg)</Label>
                    <Input
                      className="h-12 rounded-2xl text-base"
                      type="number"
                      value={form.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      placeholder="65"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>体脂肪率（任意）</Label>
                    <Input
                      className="h-12 rounded-2xl text-base"
                      type="number"
                      value={form.bodyFat}
                      onChange={(e) => handleChange("bodyFat", e.target.value)}
                      placeholder="例: 20"
                    />
                    <p className="text-xs text-slate-500">入力した場合は、体脂肪率も考慮して計算します。</p>
                  </div>

                  <div className="space-y-2">
                    <Label>活動量</Label>
                    <Select value={form.activity} onValueChange={(value) => handleChange("activity", value)}>
                      <SelectTrigger className="h-12 rounded-2xl text-base justify-between">
                        <SelectValue placeholder="活動量を選択" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl">
                        {activityOptions.map((option) => (
                          <SelectItem
                            key={option.label}
                            value={String(option.value)}
                            className="text-base py-3"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-5">
                  <Button
                    className="w-full h-12 rounded-xl text-base font-semibold mt-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSubmit}
                    disabled={!isValid}
                  >
                    計測する
                  </Button>

                  <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-600 leading-relaxed space-y-4">
                    <p>
                      TDEE（Total Daily Energy Expenditure）は、1日に消費する総カロリーの目安です。
                      基礎代謝（BMR）に日常の活動量を掛けて計算されます。
                    </p>

                    <div className="space-y-3 text-sm text-slate-700">
                      <div>
                        <p className="font-semibold">基礎代謝（約70%）</p>
                        <p className="text-slate-600">何もしていなくても消費されるエネルギー（呼吸・体温維持・内臓の働きなど）</p>
                      </div>

                      <div>
                        <p className="font-semibold">運動・日常活動（約20%）</p>
                        <p className="text-slate-600">歩く・運動・家事など、体を動かすことで消費されるエネルギー</p>
                      </div>

                      <div>
                        <p className="font-semibold">食事誘発性熱産生（TEF）（約10%）</p>
                        <p className="text-slate-600">食べたものを消化・吸収する際に消費されるエネルギー</p>
                      </div>
                                        
                  </div>

                </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            

            <div className="space-y-3">
              <div className="text-sm text-slate-700 leading-relaxed px-1">
                あなたは <span className="font-semibold">{parsed?.age}歳</span> の
                <span className="font-semibold"> {form.sex === "male" ? "男性" : "女性"}</span> で、
                身長 <span className="font-semibold">{parsed?.height}cm</span>、体重 <span className="font-semibold">{parsed?.weight}kg</span>、
                活動量は <span className="font-semibold">{activityOptions.find((a) => String(a.value) === form.activity)?.label}</span> です。
              </div>

              <div className="px-1">
                <p className="text-xl font-bold text-slate-800 mb-3">推定TDEE</p>
                <div className="rounded-2xl bg-white text-center border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-6">
                    <p className="text-3xl font-bold tracking-tight text-slate-800">{parsed?.maintain}</p>
                    <p className="text-sm text-slate-500 mt-1">kcal / 日</p>
                  </div>
                  <div className="border-t px-4 py-6 bg-white">
                    <p className="text-3xl font-bold tracking-tight text-slate-800">{parsed?.maintainWeekly}</p>
                    <p className="text-sm text-slate-500 mt-1">kcal / 週</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="rounded-[28px] shadow-lg border-0 overflow-hidden">
              
              <CardContent className="space-y-5 px-5 pb-6 sm:px-6">
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <Card className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <p className="text-lg font-semibold text-slate-800">BMI</p>
                      <p className="text-4xl font-bold text-slate-800">{parsed?.bmi?.toFixed(1)}</p>
                      <p className="text-sm text-slate-600">
                        BMIは <span className="font-semibold">{parsed?.bmi?.toFixed(1)}</span> で、
                        判定は <span className="font-semibold">{parsed?.bmiCategory}</span> です。
                      </p>
                      <div className="border-t pt-3 space-y-2 text-sm text-slate-600">
                        <div className={`flex items-center justify-between ${parsed && parsed.bmi < 18.5 ? "font-semibold text-slate-900" : ""}`}>
                          <span>18.5未満</span>
                          <span>低体重</span>
                        </div>
                        <div className={`flex items-center justify-between ${parsed && parsed.bmi >= 18.5 && parsed.bmi < 25 ? "font-semibold text-slate-900" : ""}`}>
                          <span>18.5〜24.9</span>
                          <span>普通体重</span>
                        </div>
                        <div className={`flex items-center justify-between ${parsed && parsed.bmi >= 25 && parsed.bmi < 30 ? "font-semibold text-slate-900" : ""}`}>
                          <span>25.0〜29.9</span>
                          <span>肥満（1度）</span>
                        </div>
                        <div className={`flex items-center justify-between ${parsed && parsed.bmi >= 30 ? "font-semibold text-slate-900" : ""}`}>
                          <span>30以上</span>
                          <span>肥満</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <p className="text-lg font-semibold text-slate-800">活動量ごとの消費カロリー</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between border-b pb-2 text-slate-600">
                          <span>基礎代謝</span>
                          <span>{roundToNearest5(parsed?.bmr ?? 0)} kcal / 日</span>
                        </div>
                        {parsed?.activityCalories.map((item) => (
                          <div
                            key={item.label}
                            className={`flex items-center justify-between border-b pb-2 ${item.isSelected ? "font-bold text-slate-900" : "text-slate-600"}`}
                          >
                            <span>{item.label}</span>
                            <span>{item.calories} kcal / 日</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-3 grid-cols-1">
                  <Card className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Flame className="h-5 w-5" />
                        <p className="font-semibold">維持</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{parsed?.maintain} kcal</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <TrendingDown className="h-5 w-5" />
                        <p className="font-semibold">減量</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{parsed?.cutRange.low}〜{parsed?.cutRange.high} kcal</p>
                      
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <TrendingUp className="h-5 w-5" />
                        <p className="font-semibold">増量</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{parsed?.gainRange.low}〜{parsed?.gainRange.high} kcal</p>
                      
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
