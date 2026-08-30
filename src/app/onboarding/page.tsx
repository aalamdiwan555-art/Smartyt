"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { ArrowRight, ArrowLeft, User, Target, Video, CheckCircle } from "lucide-react";

const steps = [
  { id: "profile", title: "Your Profile", icon: User },
  { id: "channel", title: "Channel Info", icon: Video },
  { id: "goals", title: "Your Goals", icon: Target },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    creatorName: "",
    mainLanguage: "en",
    targetAudience: "",
    contentFormat: "both",
    mainTopics: [] as string[],
    goals: [] as string[],
  });
  const [topicInput, setTopicInput] = useState("");

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    toast.success("Welcome to Smartyt!");
    router.push("/dashboard");
  };

  const addTopic = () => {
    if (topicInput.trim() && !profile.mainTopics.includes(topicInput.trim())) {
      setProfile({ ...profile, mainTopics: [...profile.mainTopics, topicInput.trim()] });
      setTopicInput("");
    }
  };

  const toggleGoal = (goal: string) => {
    const newGoals = profile.goals.includes(goal)
      ? profile.goals.filter((g) => g !== goal)
      : [...profile.goals, goal];
    setProfile({ ...profile, goals: newGoals });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Smartyt</CardTitle>
          <p className="text-muted-foreground">Let us personalize your experience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} />

          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Creator Name</label>
                <Input
                  value={profile.creatorName}
                  onChange={(e) => setProfile({ ...profile, creatorName: e.target.value })}
                  placeholder="How should we call you?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Main Language</label>
                <select
                  value={profile.mainLanguage}
                  onChange={(e) => setProfile({ ...profile, mainLanguage: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Input
                  value={profile.targetAudience}
                  onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                  placeholder="e.g., Tech enthusiasts, beginners, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content Format</label>
                <div className="flex gap-2 mt-1">
                  {["long_form", "shorts", "both"].map((format) => (
                    <Button
                      key={format}
                      variant={profile.contentFormat === format ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProfile({ ...profile, contentFormat: format })}
                    >
                      {format === "long_form" ? "Long Form" : format === "shorts" ? "Shorts" : "Both"}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Main Topics</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Add a topic"
                    onKeyDown={(e) => e.key === "Enter" && addTopic()}
                  />
                  <Button onClick={addTopic} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.mainTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Your Goals</label>
              <div className="space-y-2">
                {[
                  "More views",
                  "More subscribers",
                  "Better SEO",
                  "Better consistency",
                  "Better CTR",
                  "Better content ideas",
                ].map((goal) => (
                  <div
                    key={goal}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      profile.goals.includes(goal)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    <div
                      className={`h-5 w-5 rounded border flex items-center justify-center ${
                        profile.goals.includes(goal)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {profile.goals.includes(goal) && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
