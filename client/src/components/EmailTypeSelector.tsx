import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";

interface EmailTypeSelectorProps {
  currentType: string;
  onTypeChange: (type: string) => void;
}

export default function EmailTypeSelector({ 
  currentType, 
  onTypeChange 
}: EmailTypeSelectorProps) {
  return (
    <Tabs 
      defaultValue={currentType} 
      className="w-full mb-6"
      onValueChange={onTypeChange}
    >
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="gmail" className="flex items-center">
          <Mail className="mr-2 h-4 w-4" />
          Gmail Style
        </TabsTrigger>
        <TabsTrigger value="sso" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          SSO Email <Badge className="ml-2 text-xs" variant="outline">New</Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="gmail" className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
        Generate Gmail-like temporary addresses for general verification messages and OTPs
      </TabsContent>
      
      <TabsContent value="sso" className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
        Create SSO-compatible temporary addresses for single sign-on authentications
      </TabsContent>
    </Tabs>
  );
}