import { useState } from "react";
import { useTasks, useUpdateTask } from "@/api/tasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskFilters, TaskStatus } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";

export function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const { data: tasks, isLoading } = useTasks(filters);
  const updateTask = useUpdateTask();

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask.mutateAsync({ taskId, status });
  };

  const openTasks = tasks?.filter((t) => t.status === "open") || [];
  const inProgressTasks =
    tasks?.filter((t) => t.status === "in_progress") || [];
  const doneTasks = tasks?.filter((t) => t.status === "done") || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Action Items</h1>
          <div className="flex gap-2">
            <Button
              variant={!filters.status ? "default" : "outline"}
              onClick={() => setFilters({})}
            >
              All
            </Button>
            <Button
              variant={filters.status === "open" ? "default" : "outline"}
              onClick={() => setFilters({ status: "open" })}
            >
              Open
            </Button>
            <Button
              variant={filters.status === "in_progress" ? "default" : "outline"}
              onClick={() => setFilters({ status: "in_progress" })}
            >
              In Progress
            </Button>
            <Button
              variant={filters.status === "done" ? "default" : "outline"}
              onClick={() => setFilters({ status: "done" })}
            >
              Done
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {openTasks.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {inProgressTasks.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Done</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {doneTasks.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleStatusChange(
                              task.id,
                              task.status === "done" ? "open" : "done",
                            )
                          }
                        >
                          {task.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-12 mt-2">
                        <Badge variant="outline">{task.department}</Badge>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        {task.vendor && (
                          <Badge variant="secondary">
                            {task.vendor.company_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(task.id, "in_progress")
                          }
                        >
                          Start
                        </Button>
                      )}
                      {task.status !== "done" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(task.id, "done")}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">No tasks found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
