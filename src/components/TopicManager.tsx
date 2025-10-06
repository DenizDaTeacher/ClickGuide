import { useState } from 'react';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTopics } from '@/hooks/useTopics';
import { Topic } from '@/types/topics';

export const TopicManager = () => {
  const { topics, loading, saveTopic, deleteTopic } = useTopics();
  const [editingTopic, setEditingTopic] = useState<Partial<Topic> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!editingTopic) return;
    await saveTopic(editingTopic);
    setEditingTopic(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingTopic({
      name: '',
      description: '',
      icon: '📋',
      color: '#3b82f6',
      sort_order: topics.length,
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4">Lade Anliegen...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anliegen verwalten</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              Neues Anliegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTopic?.id ? 'Anliegen bearbeiten' : 'Neues Anliegen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingTopic?.name || ''}
                  onChange={(e) =>
                    setEditingTopic({ ...editingTopic, name: e.target.value })
                  }
                  placeholder="z.B. Tarifwechsel"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={editingTopic?.description || ''}
                  onChange={(e) =>
                    setEditingTopic({ ...editingTopic, description: e.target.value })
                  }
                  placeholder="Beschreibung des Anliegens"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={editingTopic?.icon || ''}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, icon: e.target.value })
                    }
                    placeholder="📋"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Farbe</Label>
                  <Input
                    id="color"
                    type="color"
                    value={editingTopic?.color || '#3b82f6'}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, color: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl">{topic.icon}</span>
                <CardTitle>{topic.name}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(topic)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTopic(topic.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
