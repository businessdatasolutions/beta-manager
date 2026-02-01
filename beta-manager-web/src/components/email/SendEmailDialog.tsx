import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { useTemplates } from '../../hooks/useTemplates';
import { useRenderTesterEmail } from '../../hooks/useTesters';
import type { Tester } from '../../types/tester';
import type { RenderedEmail } from '../../api/testers';

interface SendEmailDialogProps {
  tester: Tester;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendEmailDialog({
  tester,
  onClose,
}: SendEmailDialogProps) {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [renderedEmail, setRenderedEmail] = useState<RenderedEmail | null>(null);
  const [copySuccess, setCopySuccess] = useState<'subject' | 'body' | 'all' | null>(null);

  const { data: templatesData, isLoading: templatesLoading } = useTemplates();
  const renderEmail = useRenderTesterEmail();

  const templates = templatesData?.results.filter((t) => t.is_active) || [];

  // Set default template when loaded
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].name);
    }
  }, [templates, selectedTemplate]);

  // Clear rendered email when inputs change
  useEffect(() => {
    setRenderedEmail(null);
  }, [mode, selectedTemplate, customSubject, customBody]);

  function handleRender() {
    if (mode === 'template' && selectedTemplate) {
      renderEmail.mutate(
        { id: tester.id, params: { template_name: selectedTemplate } },
        {
          onSuccess: (data) => {
            setRenderedEmail(data);
          },
        }
      );
    } else if (mode === 'custom' && customSubject && customBody) {
      renderEmail.mutate(
        {
          id: tester.id,
          params: { custom_subject: customSubject, custom_body: customBody },
        },
        {
          onSuccess: (data) => {
            setRenderedEmail(data);
          },
        }
      );
    }
  }

  async function copyToClipboard(text: string, type: 'subject' | 'body' | 'all') {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function handleCopySubject() {
    if (renderedEmail) {
      copyToClipboard(renderedEmail.subject, 'subject');
    }
  }

  function handleCopyBody() {
    if (renderedEmail) {
      // Strip HTML tags for plain text copy
      const plainText = renderedEmail.body.replace(/<[^>]*>/g, '');
      copyToClipboard(plainText, 'body');
    }
  }

  function handleCopyAll() {
    if (renderedEmail) {
      const plainBody = renderedEmail.body.replace(/<[^>]*>/g, '');
      const fullText = `Subject: ${renderedEmail.subject}\n\n${plainBody}`;
      copyToClipboard(fullText, 'all');
    }
  }

  const canRender =
    (mode === 'template' && selectedTemplate) ||
    (mode === 'custom' && customSubject.trim() && customBody.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Prepare Email for {tester.name}</CardTitle>
          <p className="text-sm text-gray-500">
            Generate email content to copy into your email client
          </p>
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
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
                />
              </div>

              <p className="text-xs text-gray-500">
                Available variables: {'{{'}name{'}}'}, {'{{'}email{'}}'}, {'{{'}
                days_in_test{'}}'}, {'{{'}days_remaining{'}}'}
              </p>
            </div>
          )}

          {/* Generate Button */}
          {!renderedEmail && (
            <Button
              onClick={handleRender}
              disabled={!canRender || renderEmail.isPending}
              className="w-full"
            >
              {renderEmail.isPending ? 'Generating...' : 'Generate Email'}
            </Button>
          )}

          {renderEmail.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              Failed to render email. Please try again.
            </div>
          )}

          {/* Rendered Email Preview */}
          {renderedEmail && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Email Preview</h3>
                <p className="text-sm text-gray-500">To: {renderedEmail.to}</p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Subject</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySubject}
                  >
                    {copySuccess === 'subject' ? 'Copied!' : 'Copy Subject'}
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {renderedEmail.subject}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Body</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyBody}
                  >
                    {copySuccess === 'body' ? 'Copied!' : 'Copy Body'}
                  </Button>
                </div>
                <div
                  className="bg-gray-50 p-3 rounded border text-sm max-h-[200px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: renderedEmail.body }}
                />
              </div>

              {/* Copy All Button */}
              <Button
                onClick={handleCopyAll}
                className="w-full"
                variant={copySuccess === 'all' ? 'outline' : 'default'}
              >
                {copySuccess === 'all' ? 'Copied to Clipboard!' : 'Copy All'}
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {renderedEmail ? 'Done' : 'Cancel'}
            </Button>
            {renderedEmail && (
              <Button
                variant="outline"
                onClick={() => setRenderedEmail(null)}
              >
                Start Over
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
