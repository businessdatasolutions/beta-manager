import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { useTemplates } from '../../hooks/useTemplates';
import { useSendTesterEmail } from '../../hooks/useTesters';
import type { Tester } from '../../types/tester';

interface SendEmailDialogProps {
  tester: Tester;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendEmailDialog({
  tester,
  onClose,
  onSuccess,
}: SendEmailDialogProps) {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  const { data: templatesData, isLoading: templatesLoading } = useTemplates();
  const sendEmail = useSendTesterEmail();

  const templates = templatesData?.results.filter((t) => t.is_active) || [];

  // Set default template when loaded
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].name);
    }
  }, [templates, selectedTemplate]);

  function handleSend() {
    if (mode === 'template' && selectedTemplate) {
      sendEmail.mutate(
        { id: tester.id, params: { templateName: selectedTemplate } },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else if (mode === 'custom' && customSubject && customBody) {
      sendEmail.mutate(
        {
          id: tester.id,
          params: { subject: customSubject, body: customBody },
        },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    }
  }

  const canSend =
    (mode === 'template' && selectedTemplate) ||
    (mode === 'custom' && customSubject.trim() && customBody.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Send Email to {tester.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'template' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('template')}
            >
              Use Template
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('custom')}
            >
              Custom Message
            </Button>
          </div>

          {mode === 'template' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                {templatesLoading ? (
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                ) : templates.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No active templates available
                  </p>
                ) : (
                  <Select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {templates.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              {selectedTemplate && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                  {templates
                    .filter((t) => t.name === selectedTemplate)
                    .map((template) => (
                      <div key={template.name}>
                        <p className="text-sm">
                          <span className="text-gray-500">Subject:</span>{' '}
                          {template.subject}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-4">
                          {template.body}
                        </p>
                        {template.variables.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Variables: {template.variables.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <textarea
                  id="body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Enter your message..."
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] resize-y"
                />
              </div>

              <p className="text-xs text-gray-500">
                Available variables: {'{'}name{'}'}, {'{'}email{'}'}, {'{'}
                days_in_test{'}'}, {'{'}days_remaining{'}'}
              </p>
            </div>
          )}

          {sendEmail.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              Failed to send email. Please try again.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={sendEmail.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!canSend || sendEmail.isPending}
            >
              {sendEmail.isPending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
