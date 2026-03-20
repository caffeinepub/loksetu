import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
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

  let issues = Map.empty<Nat, Issue>();
  var nextIssueId = 0;
  let userStats = Map.empty<Principal, UserStats>();
  var marketRates : ?MarketRates = null;
  let newsList = List.empty<News>();

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
};
