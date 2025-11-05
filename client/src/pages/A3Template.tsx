import { useState } from "react";

export default function A3Template() {
  const [formData, setFormData] = useState({
    title: "",
    owner: "",
    date: new Date().toISOString().split('T')[0],
    background: "",
    currentConditions: "",
    goals: "",
    rootCause: "",
    countermeasures: "",
    implementationPlan: "",
    followUp: "",
    results: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving A3:", formData);
    // TODO: Implement save to database
    alert("A3 saved successfully!");
  };

  const handleExport = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `A3_${formData.title.replace(/\s+/g, '_')}_${formData.date}.md`;
    a.click();
  };

  const generateMarkdown = () => {
    return `# A3 Problem-Solving Framework

**Problem Title:** ${formData.title}
**Owner:** ${formData.owner}
**Date:** ${formData.date}

---

## 1. Background & Importance

${formData.background}

## 2. Current Conditions

${formData.currentConditions}

## 3. Goals & Target Conditions

${formData.goals}

## 4. Root Cause Analysis

${formData.rootCause}

## 5. Proposed Countermeasures

${formData.countermeasures}

## 6. Implementation Plan

${formData.implementationPlan}

## 7. Follow-Up & Evaluation

${formData.followUp}

## 8. Results & Learning

${formData.results}
`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        background: "white", 
        borderRadius: "12px", 
        padding: "32px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "700", 
          color: "#7c3aed",
          marginBottom: "8px"
        }}>
          📋 A3 Problem-Solving Framework
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Use this template to systematically analyze and solve problems
        </p>

        {/* Header Section */}
        <div style={{ 
          background: "#f9fafb", 
          padding: "24px", 
          borderRadius: "8px",
          marginBottom: "24px"
        }}>
          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={{ 
                display: "block", 
                fontWeight: "600", 
                marginBottom: "8px",
                color: "#374151"
              }}>
                Problem Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Clearly and concisely state the problem"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "16px"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ 
                  display: "block", 
                  fontWeight: "600", 
                  marginBottom: "8px",
                  color: "#374151"
                }}>
                  Owner *
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleChange("owner", e.target.value)}
                  placeholder="Name of person responsible"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "16px"
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  fontWeight: "600", 
                  marginBottom: "8px",
                  color: "#374151"
                }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "16px"
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Background */}
        <Section
          number="1"
          title="Background & Importance"
          prompt="Why is this problem critical to address now? What is the business impact?"
          value={formData.background}
          onChange={(value) => handleChange("background", value)}
        />

        {/* Section 2: Current Conditions */}
        <Section
          number="2"
          title="Current Conditions"
          prompt="How do things currently work? What is the current process?"
          value={formData.currentConditions}
          onChange={(value) => handleChange("currentConditions", value)}
        />

        {/* Section 3: Goals */}
        <Section
          number="3"
          title="Goals & Target Conditions"
          prompt="What does success look like? What specific, measurable outcome are we aiming for?"
          value={formData.goals}
          onChange={(value) => handleChange("goals", value)}
        />

        {/* Section 4: Root Cause */}
        <Section
          number="4"
          title="Root Cause Analysis"
          prompt="What are the underlying causes of the problem? Use 5 Whys or Fishbone diagram."
          value={formData.rootCause}
          onChange={(value) => handleChange("rootCause", value)}
        />

        {/* Section 5: Countermeasures */}
        <Section
          number="5"
          title="Proposed Countermeasures"
          prompt="What are potential solutions to address the root causes? List at least 3 options."
          value={formData.countermeasures}
          onChange={(value) => handleChange("countermeasures", value)}
        />

        {/* Section 6: Implementation Plan */}
        <Section
          number="6"
          title="Implementation Plan"
          prompt="How will we implement the chosen countermeasures? Who does what by when?"
          value={formData.implementationPlan}
          onChange={(value) => handleChange("implementationPlan", value)}
        />

        {/* Section 7: Follow-Up */}
        <Section
          number="7"
          title="Follow-Up & Evaluation"
          prompt="How will we know if the plan is working? What metrics will we track?"
          value={formData.followUp}
          onChange={(value) => handleChange("followUp", value)}
        />

        {/* Section 8: Results */}
        <Section
          number="8"
          title="Results & Learning"
          prompt="What were the final results? What did we learn?"
          value={formData.results}
          onChange={(value) => handleChange("results", value)}
        />

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "2px solid #e5e7eb"
        }}>
          <button
            onClick={handleSave}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            💾 Save A3
          </button>

          <button
            onClick={handleExport}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            📥 Export as Markdown
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all fields?")) {
                setFormData({
                  title: "",
                  owner: "",
                  date: new Date().toISOString().split('T')[0],
                  background: "",
                  currentConditions: "",
                  goals: "",
                  rootCause: "",
                  countermeasures: "",
                  implementationPlan: "",
                  followUp: "",
                  results: ""
                });
              }
            }}
            style={{
              background: "#6b7280",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            🗑️ Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ 
  number, 
  title, 
  prompt, 
  value, 
  onChange 
}: { 
  number: string; 
  title: string; 
  prompt: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        marginBottom: "12px"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#7c3aed",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700"
        }}>
          {number}
        </div>
        <h2 style={{ 
          fontSize: "20px", 
          fontWeight: "600",
          color: "#111827"
        }}>
          {title}
        </h2>
      </div>

      <p style={{ 
        color: "#6b7280", 
        marginBottom: "12px",
        fontStyle: "italic",
        paddingLeft: "44px"
      }}>
        {prompt}
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your response for ${title}...`}
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "16px",
          fontFamily: "inherit",
          resize: "vertical"
        }}
      />
    </div>
  );
}
