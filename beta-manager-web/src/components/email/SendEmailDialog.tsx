import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { useTemplates } from '../../hooks/useTemplates';
import type { Tester } from '../../types/tester';
import {
  buildMailtoUrl,
  replaceTemplateVariables,
  calculateDaysInTest,
  calculateDaysRemaining,
  htmlToPlainText,
} from '../../utils/mailto';

interface SendEmailDialogProps {
  tester: Tester;
  onClose: () => void;
  onSuccess?: () => void;
}

// Environment config (these would come from a config in production)
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
const PLAY_STORE_LINK = import.meta.env.VITE_PLAY_STORE_LINK || 'https://play.google.com/store/apps/details?id=com.bds.bonmon';

export function SendEmailDialog({
  tester,
  onClose,
}: SendEmailDialogProps) {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: templatesData, isLoading: templatesLoading } = useTemplates();

  const templates = templatesData?.results.filter((t) => t.is_active) || [];

  // Set default template when loaded
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].name);
    }
  }, [templates, selectedTemplate]);

  // Build template variables for this tester
  const templateVariables = useMemo(() => ({
    name: tester.name,
    email: tester.email,
    days_in_test: calculateDaysInTest(tester.started_at).toString(),
    days_remaining: calculateDaysRemaining(tester.started_at).toString(),
    feedback_link: `${FRONTEND_URL}/feedback-form?tester=${tester.id}`,
    play_store_link: PLAY_STORE_LINK,
  }), [tester]);

  // Get the current template
  const currentTemplate = templates.find((t) => t.name === selectedTemplate);

  // Generate mailto URL based on current mode
  const mailtoUrl = useMemo(() => {
    if (mode === 'template' && currentTemplate) {
      const subject = replaceTemplateVariables(currentTemplate.subject, templateVariables);
      const body = replaceTemplateVariables(currentTemplate.body, templateVariables);
      return buildMailtoUrl(tester.email, subject, body);
    } else if (mode === 'custom' && customSubject && customBody) {
      const subject = replaceTemplateVariables(customSubject, templateVariables);
      const body = replaceTemplateVariables(customBody, templateVariables);
      return buildMailtoUrl(tester.email, subject, body);
    }
    return null;
  }, [mode, currentTemplate, customSubject, customBody, tester.email, templateVariables]);

  // Preview of the plain text body
  const previewBody = useMemo(() => {
    if (mode === 'template' && currentTemplate) {
      const rendered = replaceTemplateVariables(currentTemplate.body, templateVariables);
      return htmlToPlainText(rendered);
    } else if (mode === 'custom' && customBody) {
      const rendered = replaceTemplateVariables(customBody, templateVariables);
      return htmlToPlainText(rendered);
    }
    return '';
  }, [mode, currentTemplate, customBody, templateVariables]);

  const previewSubject = useMemo(() => {
    if (mode === 'template' && currentTemplate) {
      return replaceTemplateVariables(currentTemplate.subject, templateVariables);
    } else if (mode === 'custom' && customSubject) {
      return replaceTemplateVariables(customSubject, templateVariables);
    }
    return '';
  }, [mode, currentTemplate, customSubject, templateVariables]);

  const canSend =
    (mode === 'template' && selectedTemplate) ||
    (mode === 'custom' && customSubject.trim() && customBody.trim());

  // Check if URL might be too long
  const urlTooLong = mailtoUrl && mailtoUrl.length > 2000;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Email {tester.name}</CardTitle>
          <p className="text-sm text-gray-500">
            Select a template and click to open in your email client
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

          {/* Preview Section */}
          {canSend && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Preview</h3>
                <span className="text-xs text-gray-500">To: {tester.email}</span>
              </div>

              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-xs text-gray-500 mb-1">Subject:</p>
                  <p className="text-sm font-medium">{previewSubject}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded border max-h-[150px] overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-1">Body (plain text):</p>
                  <p className="text-sm whitespace-pre-wrap">{previewBody.slice(0, 500)}{previewBody.length > 500 ? '...' : ''}</p>
                </div>
              </div>

              {urlTooLong && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
                  ⚠️ Email is long and may be truncated in some email clients.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            {/* Copy button as fallback */}
            <Button
              variant="outline"
              disabled={!canSend}
              onClick={() => {
                const text = `To: ${tester.email}\nSubject: ${previewSubject}\n\n${previewBody}`;
                navigator.clipboard.writeText(text).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? 'Copied!' : 'Copy Email'}
            </Button>

            {/* Direct mailto link - user clicks this directly */}
            {mailtoUrl ? (
              <a
                href={mailtoUrl}
                onClick={() => setTimeout(onClose, 500)}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Open in Mail
              </a>
            ) : (
              <Button disabled>Open in Mail</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
