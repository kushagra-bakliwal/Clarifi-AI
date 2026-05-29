import { User, Mail, Building2, CreditCard, Bell, Lock, Globe } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';

export function ProfilePage() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-2xl">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">John Doe</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Product Manager</p>
              <Badge className="mt-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                Pro Plan
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            Change Photo
          </Button>
        </div>

        <Separator className="my-6 dark:bg-gray-700" />

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="dark:text-gray-300">First Name</Label>
              <Input
                id="firstName"
                defaultValue="John"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="dark:text-gray-300">Last Name</Label>
              <Input
                id="lastName"
                defaultValue="Doe"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="dark:text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue="john.doe@company.com"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="dark:text-gray-300 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization / Company
            </Label>
            <Input
              id="company"
              defaultValue="Tech Innovations Inc."
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Account Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5" />
          Account Plan
        </h3>
        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Plan</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Unlimited reviews, advanced analytics, AI insights
              </p>
              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-3">
                $99/month
              </p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
              Manage Plan
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Next billing date: <span className="font-medium text-gray-700 dark:text-gray-300">March 5, 2026</span></p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
        
        <div className="space-y-4">
          {/* Notification Settings */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive alerts about critical reviews and insights
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Auto-analyze Settings */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto-analyze New Reviews</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically analyze reviews as they come in
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Weekly Reports */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Summary Reports</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get a weekly digest of feedback insights
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5" />
          Security
        </h3>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Enable Two-Factor Authentication
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
