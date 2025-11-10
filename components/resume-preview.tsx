"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, MessageSquare, Globe } from "lucide-react";

export interface ResumeData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: [string, string | undefined];
  wechat?: string;
  website?: string;
  skills?: string[];
  workExperiences?: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate: Date;
    description: string;
    keyAchievements: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    major: string;
    startDate: Date;
    endDate: Date;
  }>;
}

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    try {
      return format(date, "MMM yyyy");
    } catch {
      return "";
    }
  };

  const formatDateRange = (startDate: Date | undefined, endDate: Date | undefined) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (!start && !end) return "";
    if (!end) return start;
    return `${start} - ${end}`;
  };

  const formatLocation = (location: [string, string | undefined] | undefined) => {
    if (!location || !location[0]) return "";
    if (location[1]) {
      return `${location[1]}, ${location[0]}`;
    }
    return location[0];
  };

  const splitLines = (text: string | undefined) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim());
  };

  return (
    <Card className="w-full h-fit p-8 bg-white shadow-lg print:shadow-none">
      {/* Header Section */}
      <div className="space-y-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {data.fullName || "Your Name"}
        </h1>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phoneNumber && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>{data.phoneNumber}</span>
            </div>
          )}
          {data.location && formatLocation(data.location) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{formatLocation(data.location)}</span>
            </div>
          )}
          {data.wechat && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{data.wechat}</span>
            </div>
          )}
          {data.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>{data.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Skills
          </h2>
          <Separator className="mb-4" />

          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience Section */}
      {data.workExperiences && data.workExperiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Work Experience
          </h2>
          <Separator className="mb-4" />

          <div className="space-y-4">
            {data.workExperiences.map((exp, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {exp.position || "Position"}
                    </h3>
                    <p className="text-gray-700">{exp.company || "Company"}</p>
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>

                {exp.description && (
                  <div className="text-sm text-gray-700 space-y-1">
                    {splitLines(exp.description).map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                )}

                {exp.keyAchievements && (
                  <div className="text-sm text-gray-700">
                    <ul className="list-disc list-inside space-y-1">
                      {splitLines(exp.keyAchievements).map((achievement, idx) => (
                        <li key={idx} className="ml-2">
                          {achievement.replace(/^[-•*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Education
          </h2>
          <Separator className="mb-4" />

          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {edu.school || "School Name"}
                    </h3>
                    <p className="text-gray-700">
                      {edu.degree || "Degree"}{edu.major ? ` in ${edu.major}` : ""}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!data.fullName && !data.email && !data.phoneNumber) && (
        <div className="text-center py-12 text-gray-400">
          <p>Fill in the form to see your resume preview</p>
        </div>
      )}
    </Card>
  );
}
