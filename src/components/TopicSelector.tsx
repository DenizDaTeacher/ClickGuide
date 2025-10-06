import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTopics } from '@/hooks/useTopics';
import { Topic } from '@/types/topics';

interface TopicSelectorProps {
  onSelectTopic: (topic: Topic) => void;
  selectedTopicId?: string;
}

export const TopicSelector = ({ onSelectTopic, selectedTopicId }: TopicSelectorProps) => {
  const { topics, loading } = useTopics();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Lade Anliegen...</p>
        </CardContent>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Keine Anliegen verfügbar. Bitte erstellen Sie Anliegen im Editor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Kundenanliegen auswählen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map((topic) => (
            <Button
              key={topic.id}
              variant={selectedTopicId === topic.id ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onSelectTopic(topic)}
              style={{
                borderColor: selectedTopicId === topic.id ? topic.color : undefined,
              }}
            >
              <span className="text-3xl">{topic.icon}</span>
              <span className="font-semibold text-sm">{topic.name}</span>
              {topic.description && (
                <span className="text-xs text-muted-foreground text-center">
                  {topic.description}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
