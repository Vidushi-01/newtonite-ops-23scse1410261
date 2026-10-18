export type Activity = {
  id: number;
  workItemId: number;
  action: string;
  details: string;
  timestamp: string;
};

const activities: Activity[] = [];
let nextActivityId = 1;

export function recordActivity(
  workItemId: number,
  action: string,
  details: string
): Activity {
  const activity: Activity = {
    id: nextActivityId++,
    workItemId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  activities.push(activity);
  return activity;
}

export function getActivities(workItemId: number): Activity[] {
  return activities.filter(
    (activity) => activity.workItemId === workItemId
  );
}
