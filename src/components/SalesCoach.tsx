import { useState } from 'react';
import { Search, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useObjections } from '@/hooks/useObjections';
import { ObjectionWithResponses } from '@/types/topics';

export const SalesCoach = () => {
  const { objections, findMatchingObjection } = useObjections();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjection, setSelectedObjection] = useState<ObjectionWithResponses | null>(null);
  const [matchedObjection, setMatchedObjection] = useState<ObjectionWithResponses | null>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const matched = findMatchingObjection(searchTerm);
    setMatchedObjection(matched);
    setSelectedObjection(matched);
  };

  const handleSelectObjection = (objection: ObjectionWithResponses) => {
    setSelectedObjection(objection);
    setSearchTerm('');
    setMatchedObjection(null);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          ServicePlus Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search/Select Objection */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Einwand suchen oder eingeben..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2">
            {objections.slice(0, 5).map((objection) => (
              <Button
                key={objection.id}
                variant="outline"
                size="sm"
                onClick={() => handleSelectObjection(objection)}
                className={selectedObjection?.id === objection.id ? 'border-primary' : ''}
              >
                {objection.title}
                {objection.category && (
                  <Badge variant="secondary" className="ml-2">
                    {objection.category}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Matched Objection Alert */}
        {matchedObjection && !selectedObjection && (
          <Card className="border-primary">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Passender Einwand gefunden:
              </p>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelectObjection(matchedObjection)}
              >
                {matchedObjection.title}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selected Objection with Responses */}
        {selectedObjection && (
          <div className="space-y-4">
            <Card className="bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedObjection.title}</CardTitle>
                    {selectedObjection.category && (
                      <Badge variant="outline" className="mt-1">
                        {selectedObjection.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedObjection(null)}
                  >
                    Zurücksetzen
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {selectedObjection.responses.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Empfohlene Antworten:
                </h4>
                {selectedObjection.responses.map((response, index) => (
                  <Card key={response.id} className="bg-success/5 border-success/20">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-success/10">
                          Antwort {index + 1}
                        </Badge>
                        <p className="text-sm whitespace-pre-wrap">
                          {response.response_text}
                        </p>
                        {response.follow_up_steps && response.follow_up_steps.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-success/20">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Folgeschritte:
                            </p>
                            <ul className="space-y-1">
                              {response.follow_up_steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-sm flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">{step.title}</span>
                                    {step.description && (
                                      <span className="text-muted-foreground">
                                        {' '}
                                        - {step.description}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Keine Antworten für diesen Einwand hinterlegt.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
