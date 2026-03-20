import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";



actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type IssueCategory = {
    #corruption;
    #sanitation;
    #infrastructure;
    #publicSafety;
    #healthcare;
    #other;
  };

  type Issue = {
    id : Nat;
    title : Text;
    description : Text;
    category : IssueCategory;
    gpsLocation : Text;
    photoBlob : ?Storage.ExternalBlob;
    isVigilance : Bool;
    timestamp : Int;
    upvotes : Nat;
    reporter : Principal;
  };

  type UserStats = {
    reportsCount : Nat;
    unlockedCertificate : Bool;
  };

  type MarketRates = {
    petrol : Text;
    diesel : Text;
    cng : Text;
    lpg : Text;
    onion : Text;
    tomato : Text;
    potato : Text;
  };

  type News = {
    headline : Text;
    timestamp : Int;
  };

  type UserProfile = {
    displayName : Text;
    anonymousMode : Bool;
    alias : Text;
  };

  type CommunityPost = {
    id : Nat;
    author : Principal;
    displayName : Text;
    city : Text;
    content : Text;
    mediaBlob : ?Storage.ExternalBlob;
    timestamp : Int;
    likeCount : Nat;
  };

  type PrivateMessage = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    mediaBlob : ?Storage.ExternalBlob;
    timestamp : Int;
  };

  type Status = {
    author : Principal;
    displayName : Text;
    city : Text;
    content : Text;
    photoBlob : ?Storage.ExternalBlob;
    timestamp : Int;
  };

  let issues = Map.empty<Nat, Issue>();
  var nextIssueId = 0;
  let userStats = Map.empty<Principal, UserStats>();
  var marketRates : ?MarketRates = null;
  let newsList = List.empty<News>();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let communityPosts = Map.empty<Nat, CommunityPost>();
  var nextPostId = 0;
  let privateMessages = Map.empty<Nat, PrivateMessage>();
  var nextMessageId = 0;
  let statuses = Map.empty<Principal, Status>();

  public query ({ caller }) func getPublicIssues() : async [Issue] {
    issues.values().filter(func(issue) { not issue.isVigilance }).toArray().sort(
      func(a, b) { if (a.timestamp > b.timestamp) { #less } else { #greater } },
    );
  };

  public shared ({ caller }) func createIssue(
    title : Text,
    description : Text,
    category : IssueCategory,
    gpsLocation : Text,
    photoBlobId : ?Text,
    isVigilance : Bool,
  ) : async Nat {
    // Allow both authenticated users and guests to submit civic reports
    let photoBlob = switch (photoBlobId) {
      case (null) { null };
      case (?_id) { null };
    };

    let issue : Issue = {
      id = nextIssueId;
      title;
      description;
      category;
      gpsLocation;
      photoBlob;
      isVigilance;
      timestamp = Time.now();
      upvotes = 0;
      reporter = caller;
    };

    issues.add(nextIssueId, issue);
    nextIssueId += 1;

    updateUserStats(caller);

    issue.id;
  };

  func updateUserStats(user : Principal) {
    let currentStats = switch (userStats.get(user)) {
      case (null) {
        {
          reportsCount = 0;
          unlockedCertificate = false;
        };
      };
      case (?stats) { stats };
    };

    let newStats = {
      reportsCount = currentStats.reportsCount + 1;
      unlockedCertificate = currentStats.reportsCount + 1 >= 50;
    };

    userStats.add(user, newStats);
  };

  public query ({ caller }) func getUserStats() : async UserStats {
    switch (userStats.get(caller)) {
      case (null) {
        {
          reportsCount = 0;
          unlockedCertificate = false;
        };
      };
      case (?stats) { stats };
    };
  };

  public shared ({ caller }) func setMarketRates(
    petrol : Text,
    diesel : Text,
    cng : Text,
    lpg : Text,
    onion : Text,
    tomato : Text,
    potato : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set market rates");
    };

    marketRates := ?{
      petrol;
      diesel;
      cng;
      lpg;
      onion;
      tomato;
      potato;
    };
  };

  public query ({ caller }) func getMarketRates() : async MarketRates {
    switch (marketRates) {
      case (null) { Runtime.trap("Market rates not set") };
      case (?rates) { rates };
    };
  };

  public shared ({ caller }) func addNews(headline : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add news");
    };

    let news = {
      headline;
      timestamp = Time.now();
    };

    newsList.add(news);
  };

  public query ({ caller }) func getNews() : async [News] {
    newsList.toArray().reverse();
  };

  public shared ({ caller }) func upvoteIssue(issueId : Nat) : async () {
    // Allow all users (including guests) to upvote
    switch (issues.get(issueId)) {
      case (null) { Runtime.trap("Issue not found") };
      case (?issue) {
        let updatedIssue = {
          id = issue.id;
          title = issue.title;
          description = issue.description;
          category = issue.category;
          gpsLocation = issue.gpsLocation;
          photoBlob = issue.photoBlob;
          isVigilance = issue.isVigilance;
          timestamp = issue.timestamp;
          upvotes = issue.upvotes + 1;
          reporter = issue.reporter;
        };
        issues.add(issueId, updatedIssue);
      };
    };
  };

  public query ({ caller }) func verifyImage(_blobId : Text) : async Bool {
    true;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Legacy User Profile Functions
  public shared ({ caller }) func setDisplayName(displayName : Text, anonymousMode : Bool) : async () {
    let alias = "Nagrik #" # caller.toText();
    let profile : UserProfile = {
      displayName;
      anonymousMode;
      alias;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getDisplayName(user : Principal) : async Text {
    switch (userProfiles.get(user)) {
      case (null) { "Nagrik" };
      case (?profile) {
        if (profile.anonymousMode) { profile.alias } else { profile.displayName };
      };
    };
  };

  // Community Posts
  public shared ({ caller }) func createCommunityPost(city : Text, content : Text, mediaBlobId : ?Text) : async Nat {
    // Allow all users (including guests) to post in community
    let mediaBlob = switch (mediaBlobId) {
      case (null) { null };
      case (?_id) { null };
    };

    let displayName = switch (userProfiles.get(caller)) {
      case (null) { "Nagrik" };
      case (?profile) {
        if (profile.anonymousMode) { profile.alias } else { profile.displayName };
      };
    };

    let post : CommunityPost = {
      id = nextPostId;
      author = caller;
      displayName;
      city;
      content;
      mediaBlob;
      timestamp = Time.now();
      likeCount = 0;
    };

    communityPosts.add(nextPostId, post);
    nextPostId += 1;

    post.id;
  };

  public shared ({ caller }) func likeCommunityPost(postId : Nat) : async () {
    // Allow all users (including guests) to like posts
    switch (communityPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost = {
          id = post.id;
          author = post.author;
          displayName = post.displayName;
          city = post.city;
          content = post.content;
          mediaBlob = post.mediaBlob;
          timestamp = post.timestamp;
          likeCount = post.likeCount + 1;
        };
        communityPosts.add(postId, updatedPost);
      };
    };
  };

  public query ({ caller }) func getCommunityPostsByCity(city : Text) : async [CommunityPost] {
    if (city == "") { communityPosts.values().toArray() } else { communityPosts.values().filter(func(post) { post.city == city }).toArray() };
  };

  // Private Messages (DMs)
  public shared ({ caller }) func sendPrivateMessage(
    receiver : Principal,
    content : Text,
    mediaBlobId : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can send private messages");
    };

    let mediaBlob = switch (mediaBlobId) {
      case (null) { null };
      case (?_id) { null };
    };

    let message : PrivateMessage = {
      id = nextMessageId;
      sender = caller;
      receiver;
      content;
      mediaBlob;
      timestamp = Time.now();
    };

    privateMessages.add(nextMessageId, message);
    nextMessageId += 1;

    message.id;
  };

  public query ({ caller }) func getConversationHistory(withUser : Principal) : async [PrivateMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view conversations");
    };

    var conversation : [PrivateMessage] = [];

    for (message in privateMessages.values()) {
      if (
        (message.sender == caller and message.receiver == withUser) or
        (message.sender == withUser and message.receiver == caller)
      ) {
        conversation := conversation.concat([message]);
      };
    };

    conversation.sort(
      func(a, b) {
        if (a.timestamp < b.timestamp) {
          #less;
        } else {
          #greater;
        };
      }
    );
  };

  public query ({ caller }) func listConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return [];
    };

    let conversations = Map.empty<Principal, Bool>();

    for (message in privateMessages.values()) {
      if (message.sender == caller) {
        conversations.add(message.receiver, true);
      };
      if (message.receiver == caller) {
        conversations.add(message.sender, true);
      };
    };

    conversations.keys().toArray();
  };

  // Status
  public shared ({ caller }) func setStatus(
    city : Text,
    content : Text,
    photoBlobId : ?Text,
  ) : async () {
    // Allow all users (including guests) to set status
    let photoBlob = switch (photoBlobId) {
      case (null) { null };
      case (?_id) { null };
    };

    let displayName = switch (userProfiles.get(caller)) {
      case (null) { "Nagrik" };
      case (?profile) {
        if (profile.anonymousMode) { profile.alias } else { profile.displayName };
      };
    };

    let status : Status = {
      author = caller;
      displayName;
      city;
      content;
      photoBlob;
      timestamp = Time.now();
    };

    statuses.add(caller, status);
  };

  public query ({ caller }) func getStatusesByCity(city : Text) : async [Status] {
    let statusesByCity = List.empty<Status>();

    for ((_, status) in statuses.entries()) {
      if (city == "" or status.city == city) {
        statusesByCity.add(status);
      };
    };

    statusesByCity.toArray();
  };
};
