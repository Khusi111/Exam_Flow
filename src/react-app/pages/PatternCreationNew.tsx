import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  Users,
  Calculator,
  FileText,
  Type,
  Hash,
  Zap,
  Eye
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { api, useApi } from '../hooks/useApi';

interface Subject {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface PatternSection {
  id?: number;
  name: string;
  subject: string;
  question_type: 'mcq' | 'numerical' | 'subjective' | 'true_false' | 'fill_blank';
  start_question: number;
  end_question: number;
  marks_per_question: number;
  negative_marking: number;
  min_questions_to_attempt: number;
  is_compulsory: boolean;
  order: number;
}

interface SubjectWithSections {
  name: string;
  sections: PatternSection[];
}

interface ExamPattern {
  id?: number;
  name: string;
  description: string;
  total_questions: number;
  total_marks: number;
  total_duration: number;
  is_active: boolean;
  sections: PatternSection[];
}

export default function PatternCreation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<number, Record<string, string>>>({});
  
  const [pattern, setPattern] = useState<ExamPattern>({
    name: '',
    description: '',
    total_questions: 0,
    total_marks: 0,
    total_duration: 60,
    is_active: true,
    sections: [],
  });

  const [nextSectionOrder, setNextSectionOrder] = useState(1);

  const isEditing = Boolean(id);

  // Fetch subjects
  const { data: subjectsData } = useApi<{results: Subject[]}>('/patterns/subjects/');

  useEffect(() => {
    if (isEditing && id) {
      fetchPattern(id);
    }
  }, [id, isEditing]);

  const fetchPattern = async (patternId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/patterns/patterns/${patternId}/`);
      setPattern(response.data);
      setNextSectionOrder(response.data.sections.length + 1);
    } catch (error) {
      console.error('Failed to fetch pattern:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExamPattern, value: any) => {
    setPattern(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Helper function to group sections by subject
  const getSubjectsWithSections = (): SubjectWithSections[] => {
    const subjectMap = new Map<string, PatternSection[]>();
    
    pattern.sections.forEach(section => {
      if (!subjectMap.has(section.subject)) {
        subjectMap.set(section.subject, []);
      }
      subjectMap.get(section.subject)!.push(section);
    });

    return Array.from(subjectMap.entries()).map(([subjectName, sections]) => ({
      name: subjectName,
      sections: sections.sort((a, b) => a.order - b.order)
    }));
  };

  const addSectionToSubject = (subjectName: string) => {
    const newSection: PatternSection = {
      name: '',
      subject: subjectName,
      question_type: 'mcq',
      start_question: 1,
      end_question: 1,
      marks_per_question: 1,
      negative_marking: 0.25,
      min_questions_to_attempt: 0,
      is_compulsory: true,
      order: nextSectionOrder,
    };

    setPattern(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setNextSectionOrder(prev => prev + 1);
  };

  const updateSection = (index: number, field: keyof PatternSection, value: any) => {
    setPattern(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));

    // Clear section error
    if (sectionErrors[index]?.[field]) {
      setSectionErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' },
      }));
    }
  };

  const removeSection = (index: number) => {
    setPattern(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));

    // Clear section errors
    if (sectionErrors[index]) {
      setSectionErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!pattern.name.trim()) {
      newErrors.name = 'Pattern name is required';
    }

    if (!pattern.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (pattern.total_duration <= 0) {
      newErrors.total_duration = 'Duration must be greater than 0';
    }

    if (pattern.sections.length === 0) {
      newErrors.sections = 'At least one section is required';
    }

    // Validate sections
    const newSectionErrors: Record<number, Record<string, string>> = {};
    pattern.sections.forEach((section, index) => {
      const sectionError: Record<string, string> = {};

      if (!section.name.trim()) {
        sectionError.name = 'Section name is required';
      }

      if (!section.subject.trim()) {
        sectionError.subject = 'Subject is required';
      }

      if (section.start_question >= section.end_question) {
        sectionError.start_question = 'Start question must be less than end question';
      }

      if (section.marks_per_question <= 0) {
        sectionError.marks_per_question = 'Marks per question must be greater than 0';
      }

      if (Object.keys(sectionError).length > 0) {
        newSectionErrors[index] = sectionError;
      }
    });

    setErrors(newErrors);
    setSectionErrors(newSectionErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newSectionErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const patternData = {
        ...pattern,
        total_questions: pattern.sections.reduce((sum, section) => sum + (section.end_question - section.start_question + 1), 0),
        total_marks: pattern.sections.reduce((sum, section) => sum + ((section.end_question - section.start_question + 1) * section.marks_per_question), 0),
      };

      if (isEditing) {
        await api.put(`/patterns/patterns/${id}/`, patternData);
      } else {
        await api.post('/patterns/patterns/', patternData);
      }

      navigate('/patterns');
    } catch (error: any) {
      console.error('Failed to save pattern:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const patternData = {
        ...pattern,
        is_active: true,
        total_questions: pattern.sections.reduce((sum, section) => sum + (section.end_question - section.start_question + 1), 0),
        total_marks: pattern.sections.reduce((sum, section) => sum + ((section.end_question - section.start_question + 1) * section.marks_per_question), 0),
      };

      if (isEditing) {
        await api.put(`/patterns/patterns/${id}/`, patternData);
      } else {
        await api.post('/patterns/patterns/', patternData);
      }

      navigate('/patterns');
    } catch (error: any) {
      console.error('Failed to publish pattern:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return <CheckCircle className="w-3 h-3 text-blue-600" />;
      case 'numerical':
        return <Calculator className="w-3 h-3 text-green-600" />;
      case 'subjective':
        return <FileText className="w-3 h-3 text-purple-600" />;
      case 'true_false':
        return <Type className="w-3 h-3 text-orange-600" />;
      case 'fill_blank':
        return <Hash className="w-3 h-3 text-red-600" />;
      default:
        return <Type className="w-3 h-3 text-slate-600" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'bg-blue-100 text-blue-700';
      case 'numerical':
        return 'bg-green-100 text-green-700';
      case 'subjective':
        return 'bg-purple-100 text-purple-700';
      case 'true_false':
        return 'bg-orange-100 text-orange-700';
      case 'fill_blank':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading pattern...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/patterns')}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Edit Pattern' : 'Create New Pattern'}
            </h1>
            <p className="text-sm text-slate-600">Design your exam pattern structure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Pattern Information</h2>
                  <p className="text-xs text-slate-600">Basic details for your exam pattern</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pattern Name *
                  </label>
                  <input
                    type="text"
                    value={pattern.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="e.g., JEE Main Pattern"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Questions *
                  </label>
                  <input
                    type="number"
                    value={pattern.total_questions}
                    onChange={(e) => handleInputChange('total_questions', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.total_questions ? 'border-red-300' : 'border-slate-300'
                    }`}
                    min="1"
                    max="500"
                  />
                  {errors.total_questions && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.total_questions}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={pattern.total_marks}
                    onChange={(e) => handleInputChange('total_marks', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.total_marks ? 'border-red-300' : 'border-slate-300'
                    }`}
                    min="1"
                  />
                  {errors.total_marks && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.total_marks}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    value={pattern.total_duration}
                    onChange={(e) => handleInputChange('total_duration', parseInt(e.target.value) || 60)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.total_duration ? 'border-red-300' : 'border-slate-300'
                    }`}
                    min="1"
                  />
                  {errors.total_duration && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.total_duration}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={pattern.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe the pattern structure and purpose..."
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-slate-700">Active Pattern</label>
                  <p className="text-xs text-slate-500">Make this pattern available for use</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pattern.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Subject-Based Sections */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Pattern Structure</h2>
                  <p className="text-xs text-slate-600">Organize sections by subject</p>
                </div>
              </div>

              {errors.sections && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sections}
                  </p>
                </div>
              )}

              {/* Available Subjects */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Available Subjects</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {subjectsData?.results?.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => addSectionToSubject(subject.name)}
                      className="p-2 text-xs border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                    >
                      <div className="font-medium text-slate-700">{subject.name}</div>
                      <div className="text-slate-500">Add Section</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Groups */}
              <div className="space-y-4">
                {getSubjectsWithSections().map((subjectGroup, subjectIndex) => (
                  <div key={subjectIndex} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-slate-800 text-sm">{subjectGroup.name}</h4>
                        <span className="text-xs text-slate-500">
                          ({subjectGroup.sections.length} sections)
                        </span>
                      </div>
                      <button
                        onClick={() => addSectionToSubject(subjectGroup.name)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Section
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subjectGroup.sections.map((section, sectionIndex) => {
                        const globalIndex = pattern.sections.findIndex(s => s === section);
                        return (
                          <div key={globalIndex} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium text-slate-600">
                                  {sectionIndex + 1}
                                </span>
                                <h5 className="text-sm font-medium text-slate-900">{section.name || 'Untitled Section'}</h5>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(section.question_type)}`}>
                                  {getQuestionTypeIcon(section.question_type)}
                                  {section.question_type.toUpperCase()}
                                </span>
                              </div>
                              <button
                                onClick={() => removeSection(globalIndex)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Section Name</label>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => updateSection(globalIndex, 'name', e.target.value)}
                                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    sectionErrors[globalIndex]?.name ? 'border-red-300' : 'border-slate-300'
                                  }`}
                                  placeholder="Section name"
                                />
                                {sectionErrors[globalIndex]?.name && (
                                  <p className="text-red-600 text-xs mt-1">{sectionErrors[globalIndex].name}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Question Type</label>
                                <select
                                  value={section.question_type}
                                  onChange={(e) => updateSection(globalIndex, 'question_type', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                  <option value="mcq">MCQ</option>
                                  <option value="numerical">Numerical</option>
                                  <option value="subjective">Subjective</option>
                                  <option value="true_false">True/False</option>
                                  <option value="fill_blank">Fill Blank</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start Q</label>
                                <input
                                  type="number"
                                  value={section.start_question}
                                  onChange={(e) => updateSection(globalIndex, 'start_question', parseInt(e.target.value) || 1)}
                                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    sectionErrors[globalIndex]?.start_question ? 'border-red-300' : 'border-slate-300'
                                  }`}
                                  min="1"
                                />
                                {sectionErrors[globalIndex]?.start_question && (
                                  <p className="text-red-600 text-xs mt-1">{sectionErrors[globalIndex].start_question}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End Q</label>
                                <input
                                  type="number"
                                  value={section.end_question}
                                  onChange={(e) => updateSection(globalIndex, 'end_question', parseInt(e.target.value) || 1)}
                                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    sectionErrors[globalIndex]?.end_question ? 'border-red-300' : 'border-slate-300'
                                  }`}
                                  min="1"
                                />
                                {sectionErrors[globalIndex]?.end_question && (
                                  <p className="text-red-600 text-xs mt-1">{sectionErrors[globalIndex].end_question}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Marks/Q</label>
                                <input
                                  type="number"
                                  value={section.marks_per_question}
                                  onChange={(e) => updateSection(globalIndex, 'marks_per_question', parseInt(e.target.value) || 1)}
                                  className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    sectionErrors[globalIndex]?.marks_per_question ? 'border-red-300' : 'border-slate-300'
                                  }`}
                                  min="1"
                                />
                                {sectionErrors[globalIndex]?.marks_per_question && (
                                  <p className="text-red-600 text-xs mt-1">{sectionErrors[globalIndex].marks_per_question}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Neg. Mark</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={section.negative_marking}
                                  onChange={(e) => updateSection(globalIndex, 'negative_marking', parseFloat(e.target.value) || 0.25)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                                  min="0"
                                  max="1"
                                />
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                              <div className="flex items-center gap-2">
                                <span>Questions {section.start_question}-{section.end_question}</span>
                                <span>•</span>
                                <span>{section.end_question - section.start_question + 1} questions</span>
                              </div>
                              <div className="font-medium">
                                Total: {(section.end_question - section.start_question + 1) * section.marks_per_question} marks
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-4">
            {/* Pattern Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Pattern Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Total Questions</span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">{pattern.total_questions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Total Marks</span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">{pattern.total_marks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Duration</span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">{pattern.total_duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Sections</span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">{pattern.sections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Subjects</span>
                  </div>
                  <span className="text-xs font-medium text-slate-900">{getSubjectsWithSections().length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'Saving...' : 'Save Pattern'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  {saving ? 'Publishing...' : 'Save & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
