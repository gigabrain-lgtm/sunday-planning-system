import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function LifePlanning() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [activeTab, setActiveTab] = useState("habits");

  // Queries
  const { data: categories } = trpc.lifePlanning.getCategories.useQuery();
  const { data: habits } = trpc.lifePlanning.getHabits.useQuery({ activeOnly: true });
  const { data: profile } = trpc.lifePlanning.getProfile.useQuery();
  const { data: activeQuests } = trpc.lifePlanning.getActiveQuests.useQuery();
  const { data: reflection } = trpc.lifePlanning.getReflection.useQuery({ date: selectedDate });
  
  const { data: completions } = trpc.lifePlanning.getCompletions.useQuery({
    startDate: selectedDate,
    endDate: selectedDate,
  });

  // Mutations
  const toggleCompletionMutation = trpc.lifePlanning.toggleCompletion.useMutation({
    onSuccess: () => {
      toast.success("Habit updated!");
    },
    onError: (error) => {
      toast.error(`Failed to update habit: ${error.message}`);
    },
  });

  const saveReflectionMutation = trpc.lifePlanning.saveReflection.useMutation({
    onSuccess: () => {
      toast.success("Reflection saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save reflection: ${error.message}`);
    },
  });

  const completeQuestMutation = trpc.lifePlanning.completeQuest.useMutation({
    onSuccess: () => {
      toast.success("Quest completed! 🎉");
    },
  });

  // Group habits by category
  const habitsByCategory = habits?.reduce((acc, habit) => {
    if (!acc[habit.categoryId]) {
      acc[habit.categoryId] = [];
    }
    acc[habit.categoryId].push(habit);
    return acc;
  }, {} as Record<number, typeof habits>);

  // Check if habit is completed
  const isHabitCompleted = (habitId: number) => {
    return completions?.some(c => c.habitId === habitId && c.completed) || false;
  };

  // Toggle habit completion
  const toggleHabit = (habitId: number) => {
    const currentlyCompleted = isHabitCompleted(habitId);
    toggleCompletionMutation.mutate({
      habitId,
      date: selectedDate,
      completed: !currentlyCompleted,
    });
  };

  // Calculate XP progress percentage
  const xpProgress = profile ? (profile.currentXp / profile.xpToNextLevel) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header with Gamification Stats */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Life Planning
            </h2>
            <p className="text-purple-100 mt-1">Track your habits, complete quests, level up!</p>
          </div>
          
          {profile && (
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Trophy className="w-6 h-6" />
                  Level {profile.level}
                </div>
                <div className="text-sm text-purple-100">
                  {profile.currentXp} / {profile.xpToNextLevel} XP
                </div>
                <Progress value={xpProgress} className="mt-2 h-2 bg-purple-300" />
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Flame className="w-6 h-6" />
                  {profile.currentStreak}
                </div>
                <div className="text-sm text-purple-100">Day Streak</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Star className="w-6 h-6" />
                  {profile.impulsePoints}
                </div>
                <div className="text-sm text-purple-100">Impulse Points</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Date:</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="habits">Daily Habits</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="reflection">Daily Reflection</TabsTrigger>
        </TabsList>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          {categories?.map((category) => {
            const categoryHabits = habitsByCategory?.[category.id] || [];
            if (categoryHabits.length === 0) return null;

            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {category.icon} {category.name}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {categoryHabits.map((habit) => {
                    const completed = isHabitCompleted(habit.id);
                    
                    return (
                      <div 
                        key={habit.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          completed ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className="flex-shrink-0"
                        >
                          {completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${completed ? 'line-through text-gray-500' : ''}`}>
                            {habit.name}
                          </div>
                          {habit.description && (
                            <div className="text-sm text-gray-600">{habit.description}</div>
                          )}
                        </div>
                        
                        {habit.targetValue && (
                          <Badge variant="outline">
                            Target: {habit.targetValue} {habit.unit}
                          </Badge>
                        )}
                        
                        <Badge variant="secondary">
                          {habit.frequency}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          
          {(!categories || categories.length === 0) && (
            <Card className="p-8 text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No habits yet. Create your first habit to get started!</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Habit
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-4">
          {activeQuests && activeQuests.length > 0 ? (
            activeQuests.map((quest) => (
              <Card key={quest.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{quest.title}</h3>
                      <Badge variant={quest.questType === 'monthly' ? 'default' : 'secondary'}>
                        {quest.questType}
                      </Badge>
                    </div>
                    
                    {quest.description && (
                      <p className="text-gray-600 mb-3">{quest.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => completeQuestMutation.mutate({ questId: quest.id })}
                    disabled={quest.completed}
                  >
                    {quest.completed ? 'Completed' : 'Complete Quest'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No active quests. Create a new quest to challenge yourself!</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Quest
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Daily Reflection Tab */}
        <TabsContent value="reflection" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Daily Reflection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Daily Intention</label>
                <Textarea
                  placeholder="What is your intention for today?"
                  defaultValue={reflection?.dailyIntention || ''}
                  onBlur={(e) => {
                    saveReflectionMutation.mutate({
                      date: selectedDate,
                      dailyIntention: e.target.value,
                    });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Free Journal</label>
                <Textarea
                  placeholder="Write your thoughts..."
                  rows={5}
                  defaultValue={reflection?.freeJournal || ''}
                  onBlur={(e) => {
                    saveReflectionMutation.mutate({
                      date: selectedDate,
                      freeJournal: e.target.value,
                    });
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">One Thing I'm Grateful For</label>
                  <Textarea
                    placeholder="What are you grateful for today?"
                    defaultValue={reflection?.oneThingGrateful || ''}
                    onBlur={(e) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        oneThingGrateful: e.target.value,
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">One Thing I Learned</label>
                  <Textarea
                    placeholder="What did you learn today?"
                    defaultValue={reflection?.oneThingLearned || ''}
                    onBlur={(e) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        oneThingLearned: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sleep Time</label>
                  <Input
                    type="time"
                    defaultValue={reflection?.sleepTime || ''}
                    onBlur={(e) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        sleepTime: e.target.value,
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Wake Time</label>
                  <Input
                    type="time"
                    defaultValue={reflection?.wakeTime || ''}
                    onBlur={(e) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        wakeTime: e.target.value,
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Diet Score (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    defaultValue={reflection?.dietScore || ''}
                    onBlur={(e) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        dietScore: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promises"
                    checked={reflection?.promisesHonored || false}
                    onCheckedChange={(checked) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        promisesHonored: checked as boolean,
                      });
                    }}
                  />
                  <label htmlFor="promises" className="text-sm font-medium">
                    Promises Honored?
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="calendar"
                    checked={reflection?.calendarAudited || false}
                    onCheckedChange={(checked) => {
                      saveReflectionMutation.mutate({
                        date: selectedDate,
                        calendarAudited: checked as boolean,
                      });
                    }}
                  />
                  <label htmlFor="calendar" className="text-sm font-medium">
                    Calendar Audited?
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
