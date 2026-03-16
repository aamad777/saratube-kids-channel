import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Check, Copy, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const NASSetupGuide = () => {
  const [step, setStep] = useState(1);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className="border-none shadow-card rounded-3xl overflow-hidden bg-gradient-to-br from-white to-sara-blue-light/20">
      <CardHeader className="bg-sara-blue/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sara-blue flex items-center justify-center text-white">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Synology NAS Setup Guide</CardTitle>
            <CardDescription>Stream your family memories directly from your home storage</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${step === i ? "bg-sara-blue" : "bg-muted"}`} 
              />
            ))}
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sara-blue text-white text-xs flex items-center justify-center">1</span>
                Install Web Station
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Open <strong>Package Center</strong> on your Synology DSM and install <strong>Web Station</strong>. 
                This allows your NAS to share files via a web link.
              </p>
              <div className="bg-muted/50 p-4 rounded-2xl border border-dashed border-muted flex items-center gap-3">
                <Info className="w-5 h-5 text-sara-blue shrink-0" />
                <p className="text-xs italic">Once installed, a new "web" folder will be created on your NAS.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sara-blue text-white text-xs flex items-center justify-center">2</span>
                Create Your Media Folder
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Using <strong>File Station</strong>, go to the <code>/web</code> folder and create a folder named <code>family-media</code>.
                Upload your photos and videos into this folder.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Example structure:</p>
                <div className="bg-black/5 p-3 rounded-xl font-mono text-xs">
                  /web/family-media/vacation.jpg <br/>
                  /web/family-media/kids-video.mp4
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sara-blue text-white text-xs flex items-center justify-center">3</span>
                Get Your Streaming Link
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Your files are now available at your NAS address. Use these links on the <strong>Upload Page</strong>.
              </p>
              <div className="bg-sara-blue/5 p-4 rounded-2xl border border-sara-blue/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sara-blue">Your QuickConnect Link:</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard("http://QuickConnect.to/aamad777/family-media/[filename]")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs font-mono break-all text-sara-blue">
                  http://QuickConnect.to/aamad777/family-media/[filename]
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Bypasses cloud limits for large video files!
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button 
              variant="hero" 
              size="sm" 
              onClick={() => step === 3 ? setStep(1) : setStep(prev => Math.min(3, prev + 1))}
              className="rounded-xl px-6"
            >
              {step === 3 ? "Restart" : "Next Step"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NASSetupGuide;
