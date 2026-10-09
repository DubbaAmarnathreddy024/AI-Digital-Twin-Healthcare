import { HelpCircle, Lightbulb } from "lucide-react";
import { Card, Disclaimer, EmptyState, SectionHeader } from "../components/common";
import FeatureBar from "../components/FeatureBar";

export default function ExplainableAI({ data }) {
  const { features } = data;
  const max = features.length ? Math.abs(features[0].value) : 0;

  return (
    <div className="page">
      <div className="grid grid-xai">
        <Card>
          <SectionHeader
            icon={Lightbulb}
            title="SHAP feature importance"
            subtitle={`Heart disease model · ${features.length} features, ordered by importance`}
          />
          {features.length ? (
            <ul className="feature-list">
              {features.map((f, i) => (
                <FeatureBar key={f.name} name={f.name} value={f.value} max={max} rank={i + 1} large />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Lightbulb}>Not Available</EmptyState>
          )}
        </Card>

        <Card className="explain-panel">
          <SectionHeader icon={HelpCircle} title="What does this mean?" />
          <p>
            SHAP values describe how much each input feature contributes to the Random Forest model&apos;s
            prediction. A longer bar means the model relied more on that feature across its predictions.
          </p>
          <p>
            The ranking shows how the model behaves. It does not show why a person develops heart disease.
          </p>
          <p className="notice">
            SHAP feature contribution does not mean medical causation. A feature with high importance is not a
            cause of disease.
          </p>
        </Card>
      </div>

      <Disclaimer>
        SHAP values describe model contributions and should not be interpreted as medical causation.
      </Disclaimer>
      <Disclaimer>
        This application is an academic/research prototype for personalized healthcare monitoring and is not a
        medical diagnosis system.
      </Disclaimer>
    </div>
  );
}
