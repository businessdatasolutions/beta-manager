import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Feedback types with Dutch labels
const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Functie verzoek' },
  { value: 'ux_issue', label: 'Gebruiksprobleem' },
  { value: 'general', label: 'Algemeen' },
] as const;

// Severity options with Dutch labels (only shown for bugs)
const SEVERITY_OPTIONS = [
  { value: '', label: 'Selecteer ernst (optioneel)' },
  { value: 'minor', label: 'Klein' },
  { value: 'major', label: 'Gemiddeld' },
  { value: 'critical', label: 'Kritiek' },
] as const;

// API URL - same logic as client.ts
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '');

type FeedbackType = typeof FEEDBACK_TYPES[number]['value'];
type Severity = '' | 'minor' | 'major' | 'critical';

export function PublicFeedbackPage() {
  const [searchParams] = useSearchParams();
  const testerId = searchParams.get('tester');

  const [type, setType] = useState<FeedbackType>('general');
  const [severity, setSeverity] = useState<Severity>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // No tester ID in URL
  if (!testerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bonnenmonster</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Ongeldige feedback link. Neem contact op met het Bonnenmonster team.
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/public/feedback`, {
        tester_id: parseInt(testerId, 10),
        type,
        severity: type === 'bug' && severity ? severity : undefined,
        title,
        content,
      });

      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('Tester niet gevonden. Controleer of je de juiste link gebruikt.');
        } else if (err.response?.status === 429) {
          setError('Te veel verzoeken. Probeer het later opnieuw.');
        } else {
          setError('Er is iets misgegaan. Probeer het later opnieuw.');
        }
      } else {
        setError('Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bonnenmonster</h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <svg
              className="w-12 h-12 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Bedankt voor je feedback!
            </h2>
            <p className="text-green-700">
              We waarderen je input en zullen deze gebruiken om Bonnenmonster te verbeteren.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Bonnenmonster
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600">
            Feedback geven
          </h2>
          <p className="mt-4 text-center text-sm text-gray-500">
            Help ons Bonnenmonster te verbeteren met jouw feedback
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type feedback
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as FeedbackType);
                  if (e.target.value !== 'bug') {
                    setSeverity('');
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                {FEEDBACK_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity (only for bugs) */}
            {type === 'bug' && (
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  Ernst
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titel
              </label>
              <input
                id="title"
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Korte omschrijving"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Beschrijving
              </label>
              <textarea
                id="content"
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                placeholder="Beschrijf je feedback zo gedetailleerd mogelijk..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Versturen...
                </span>
              ) : (
                'Feedback versturen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
